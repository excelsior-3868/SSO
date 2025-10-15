from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import UntypedToken, TokenError,RefreshToken
# from django_ratelimit.decorators import ratelimit
from django.contrib.auth import authenticate
from django.utils.decorators import method_decorator
from django.conf import settings
from .models import User, AppPermission
from .serializers import UserSerializer, LoginSerializer, PermissionSerializer, TokenValidateSerializer,ChangePasswordSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .serializers import SendResetLinktoEmailSerializer
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken,OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.backends import TokenBackend
from django.contrib.auth import get_user_model
from django.contrib.auth import update_session_auth_hash
import uuid
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.template.loader import render_to_string


# Login view
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"detail": "Invalid credentials"}, status=401)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({"detail": "Logged in successfully"})
        response.set_cookie("access_token", access_token, httponly=True, samesite='Lax')
        response.set_cookie("refresh_token", refresh_token, httponly=True, samesite='Lax')
        return response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class PermissionView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request):
        serializer = PermissionSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(id=serializer.data['user_id'])
            user.permissions.all().delete()
            for app in serializer.data['permissions']:
                AppPermission.objects.create(user=user, app_name=app)
            return Response(status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Use get_user_model() to get your custom user model
User = get_user_model()

class TokenValidateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.COOKIES.get("access_token")
        app_name = request.GET.get("app")  # Should be passed by frontend
        request_url = request.build_absolute_uri()

        if not token:
            return Response({"valid": False, "requested_url": request_url})

        try:
            # 1️⃣ Validate token
            UntypedToken(token)

            # 2️⃣ Decode token
            signing_key = getattr(settings.SIMPLE_JWT, "SIGNING_KEY", settings.SECRET_KEY)
            algorithm = settings.SIMPLE_JWT.get("ALGORITHM", "HS256")
            backend = TokenBackend(signing_key=signing_key, algorithm=algorithm)

            decoded = backend.decode(token, verify=True)
            user_id = decoded.get("user_id")
            if not user_id:
                return Response({"valid": False, "requested_url": request_url})

            # 3️⃣ Get user
            user = User.objects.get(id=user_id)

            # 4️⃣ Check app permission
            app_permitted = False
            if app_name:
                app_permitted = AppPermission.objects.filter(
                    user=user, app_name=app_name
                ).exists()

            if not app_permitted:
                return Response({
                    "valid": False,
                    "user": user.username,
                    "app": app_name,
                    "app_permitted": False,
                    "requested_url": request_url,
                    "detail": "User does not have permission for this app"
                })

            # 5️⃣ Return success
            return Response({
                "valid": True,
                "user": user.username,
                "app": app_name,
                "app_permitted": True,
                "requested_url": request_url
            })

        except (TokenError, User.DoesNotExist):
            return Response({"valid": False, "requested_url": request_url})

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Logged out successfully"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "Refresh token not provided"}, status=400)

        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)
        except:
            return Response({"detail": "Invalid or expired refresh token"}, status=401)

        response = Response({"access_token": new_access})
        response.set_cookie("access_token", new_access, httponly=True, samesite='Lax')
        return response

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        user = request.user

        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Update password
            user.set_password(new_password)
            user.save()

            # ✅ Blacklist old tokens (if enabled)
            try:
                for token in OutstandingToken.objects.filter(user=user):
                    BlacklistedToken.objects.get_or_create(token=token)
            except Exception:
                # Blacklisting not configured, ignore silently
                pass

            # ✅ Issue new tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "detail": "Password updated successfully.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                
                # Generate a password reset token (in a real app, you would use a more secure method)
                reset_token = str(uuid.uuid4())
                
                # In a real implementation, you would store this token in the database
                # and set an expiration time
                
                # Send email with reset link
                reset_link = f"http://localhost:5173/password-reset-confirm?email={email}&token={reset_token}"
                
                # Email content
                subject = "Password Reset Request"
                message = render_to_string('password_reset_email.txt', {
                    'user': user,
                    'reset_link': reset_link,
                })
                
                # In a real application, you would send the email here
                # send_mail(subject, message, 'from@example.com', [user.email])
                
                # For demo purposes, we're just returning success
                return Response({
                    "detail": "Password reset email sent successfully.",
                    "reset_link": reset_link  # Include for demo purposes
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # For security reasons, we don't reveal whether the email exists
                pass
                
        # Return success even if email doesn't exist (security best practice)
        return Response({
            "detail": "If the email exists in our system, a password reset link has been sent."
        }, status=status.HTTP_200_OK)

class SendResetLinktoEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        
        serializer = SendResetLinktoEmailSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
           
                                
            try:
                user = User.objects.get(username=username)
                email = user.email
            except User.DoesNotExist:    
                return Response({"detail": "Email not found"}, status=status.HTTP_404_NOT_FOUND)
            
            reset_token = get_random_string(64)
            reset_link = f"http://localhost:5173/password-reset-confirm?email={email}&token={reset_token}"
            send_mail(
                "Password Reset Request",
                f"Click the link to reset your password: {reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False
            )

        return Response({"detail": "Password reset link sent"}, status=status.HTTP_200_OK)

              
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(email=email)
                
                # In a real implementation, you would validate the token
                # and check if it's expired
                
                # Update the user's password
                user.set_password(new_password)
                user.save()
                
                # Invalidate all existing tokens (security best practice)
                try:
                    for token_obj in OutstandingToken.objects.filter(user=user):
                        BlacklistedToken.objects.get_or_create(token=token_obj)
                except Exception:
                    # Blacklisting not configured, ignore silently
                    pass
                
                return Response({
                    "detail": "Password has been reset successfully."
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({
                    "detail": "Invalid email or token."
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
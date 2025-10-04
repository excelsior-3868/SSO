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
from .serializers import UserSerializer, LoginSerializer, PermissionSerializer, TokenValidateSerializer
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.backends import TokenBackend
from django.contrib.auth import get_user_model
from .models import AppPermission


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

# class TokenValidateView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = TokenValidateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 UntypedToken(serializer.data['token'])
#                 return Response({'valid': True})
#             except TokenError:
#                 return Response({'valid': False})
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class TokenValidateView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         token = request.COOKIES.get("access_token")
#         if not token:
#             return Response({"valid": False})

#         try:
#             UntypedToken(token)  # validates signature + expiry
#             return Response({"valid": True})
#         except TokenError:
#             return Response({"valid": False})


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
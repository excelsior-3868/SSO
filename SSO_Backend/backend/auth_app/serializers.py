from rest_framework import serializers
from .models import User, AppPermission
from django.contrib.auth import authenticate

from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()  # read-only for GET

    class Meta:
        model = User
        fields = ['id', 'last_name','first_name','username', 'password', 'email','is_admin', 'permissions']
        extra_kwargs = {'password': {'write_only': True}}

    def get_permissions(self, obj):
        # Return list of app names from AppPermission related objects
        return list(obj.permissions.values_list('app_name', flat=True))

    def create(self, validated_data):
        permissions = validated_data.pop('permissions', [])
        user = User.objects.create_user(**validated_data)
        for app in permissions:
            AppPermission.objects.create(user=user, app_name=app)
        return user

    def update(self, instance, validated_data):
        permissions = validated_data.pop('permissions', None)
        if permissions is not None:
            instance.permissions.all().delete()
            for app in permissions:
                AppPermission.objects.create(user=instance, app_name=app)
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")

class PermissionSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    permissions = serializers.ListField(child=serializers.CharField())

class TokenValidateSerializer(serializers.Serializer):
    token = serializers.CharField()

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        # Use Django's built-in password validators
        validate_password(value)
        return value

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value

class SendResetLinktoEmailSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("No user found with this username.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, data):
        email = data.get('email')
        token = data.get('token')
        
        try:
            user = User.objects.get(email=email)
            # In a real implementation, you would validate the token here
            # For now, we'll just check that the user exists
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or token.")
        
        return data
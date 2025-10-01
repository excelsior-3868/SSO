from rest_framework import serializers
from .models import User, AppPermission
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()  # read-only for GET

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'is_admin', 'permissions']
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
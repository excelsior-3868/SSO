from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.username

class AppPermission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="permissions")
    app_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.username} - {self.app_name}"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def is_valid(self):
        from django.utils import timezone
        return timezone.now() < self.expires_at
    
    def __str__(self):
        return f"Password reset token for {self.user.username}"
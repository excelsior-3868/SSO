from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)

class AppPermission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='permissions')
    app_name = models.CharField(max_length=50)  # e.g., 'dms', 'pms'

    class Meta:
        unique_together = ('user', 'app_name')
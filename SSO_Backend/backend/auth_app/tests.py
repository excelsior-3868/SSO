from django.test import TestCase
from rest_framework.test import APIClient
from .models import User

class UserTests(TestCase):
    def setUp(self):  # 👈 Correct method name
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin',
            password='pass',
            email='admin@example.com'  # some User models require email
        )

    def test_create_user(self):
        # Log in as admin
        self.client.login(username='admin', password='pass')

        # Try creating a new user
        response = self.client.post(
            '/api/users/',
            {'username': 'test', 'password': 'pass'},
            format='json'
        )

        # Assert user creation is successful
        self.assertEqual(response.status_code, 201)

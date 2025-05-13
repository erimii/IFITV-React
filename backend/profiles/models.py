from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profiles')
    name = models.CharField(max_length=50)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10)
    preferred_genres = models.JSONField(default=list)
    liked_contents = models.JSONField(default=list)

    def __str__(self):
        return f"{self.user.username} - {self.name}"

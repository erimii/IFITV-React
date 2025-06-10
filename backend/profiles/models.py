from django.db import models
from contents.models import Content, Subgenre
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    preferred_genres = models.JSONField()
    liked_contents = models.JSONField()

    class Meta:
        db_table = 'profiles'
        managed = False



class ProfilePreferredSubgenre(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    subgenre = models.ForeignKey(Subgenre, on_delete=models.CASCADE)

    class Meta:
        db_table = 'profile_preferred_subgenres'
        unique_together = ('profile', 'subgenre')
        managed = False


class ProfileLikedContent(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.ForeignKey(Content, on_delete=models.CASCADE)

    class Meta:
        db_table = 'profile_liked_contents'
        unique_together = ('profile', 'content')
        managed = False

class WatchHistory(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    watched_at = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'watch_history'
        managed = False

from django.db import models
from django.conf import settings
from contents.models import VodContent, Subgenre

class Profile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    gesture = models.CharField(max_length=20, null=True, blank=True)
    preferred_genres = models.JSONField()
    liked_contents = models.JSONField()

    preferred_subgenres = models.ManyToManyField(
        'contents.Subgenre',
        through='ProfilePreferredSubgenre',
        related_name='preferred_by_profiles'
    )

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


class ProfileLikedVODContent(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.ForeignKey(VodContent, on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'profile_liked_vod_contents'
        unique_together = ('profile', 'content')
        managed = False

class VODWatchHistory(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    VOD_content = models.ForeignKey(VodContent, db_column='VOD_content_id', on_delete=models.CASCADE)
    watched_at = models.DateTimeField()
    watched_percent = models.IntegerField()

    class Meta:
        db_table = 'vod_watch_history'

from django.db import models

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'genres'

class Subgenre(models.Model):
    name = models.CharField(max_length=100)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name='subgenres')

    class Meta:
        db_table = 'subgenres'
        unique_together = ('genre', 'name')

# VOD 콘텐츠
class VodContent(models.Model):
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    subgenre =  models.ManyToManyField('Subgenre', through='VodContentSubgenre')
    description = models.TextField(blank=True)
    cast = models.TextField(blank=True)
    age_rating = models.CharField(max_length=50, blank=True)
    thumbnail = models.TextField(blank=True)

    class Meta:
        db_table = 'vod_contents'

class VodContentSubgenre(models.Model):
    vod_content = models.ForeignKey(VodContent, on_delete=models.CASCADE)
    subgenre = models.ForeignKey(Subgenre, on_delete=models.CASCADE)

    class Meta:
        db_table = 'vod_content_subgenres'
        unique_together = ('vod_content', 'subgenre')


# 라이브 콘텐츠
class LiveContent(models.Model):
    channel_name = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255)
    airtime = models.DateTimeField(null=True, blank=True)
    genre = models.CharField(max_length=100, blank=True)
    subgenre = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    cast = models.TextField(blank=True)
    age_rating = models.CharField(max_length=50, blank=True)
    thumbnail = models.TextField(blank=True)
    episode = models.CharField(max_length=100, blank=True)
    runtime = models.IntegerField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'live_contents'

class LiveContentSubgenre(models.Model):
    live_content = models.ForeignKey(LiveContent, on_delete=models.CASCADE)
    subgenre = models.ForeignKey(Subgenre, on_delete=models.CASCADE)

    class Meta:
        db_table = 'live_content_subgenres'
        unique_together = ('live_content', 'subgenre')

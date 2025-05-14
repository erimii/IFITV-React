from django.db import models

class Content(models.Model):
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    cast = models.TextField(blank=True)
    age_rating = models.CharField(max_length=50, blank=True)
    thumbnail = models.TextField(blank=True)
    subgenres = models.ManyToManyField('Subgenre', through='ContentSubgenre')

    class Meta:
        db_table = 'contents'

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'genres'

class Subgenre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name='subgenres')

    class Meta:
        db_table = 'subgenres'
        unique_together = ('genre', 'name')

class ContentSubgenre(models.Model):
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    subgenre = models.ForeignKey(Subgenre, on_delete=models.CASCADE)

    class Meta:
        db_table = 'content_subgenres'
        unique_together = ('content', 'subgenre')
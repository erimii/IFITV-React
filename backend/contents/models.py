from django.db import models

class Content(models.Model):
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    subgenre = models.CharField(max_length=100)
    description = models.TextField()
    cast = models.TextField()
    age_rating = models.CharField(max_length=50)
    thumbnail = models.TextField()

    def __str__(self):
        return self.title

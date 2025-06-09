from django.urls import path
from . import views

urlpatterns = [
    path('subgenres/', views.get_subgenres, name='get_subgenres'),
    path('sample_contents/', views.sample_contents_by_genre, name='sample_contents_by_genre'),
    path('subgenre_based_recommend/', views.subgenre_based_recommend),
    path('liked_based_recommend/', views.liked_based_recommend),
    path('all_vod_contents/', views.all_vod_contents),
]

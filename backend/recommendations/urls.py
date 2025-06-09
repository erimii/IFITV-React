from django.urls import path
from . import views

urlpatterns = [
    path('subgenres/', views.get_subgenres, name='get_subgenres'),
    path('preview_contents/', views.preview_contents_grouped, name='preview_contents_grouped'),
    path('subgenre_based_recommend/', views.subgenre_based_recommend),
    path('liked_based_recommend/', views.liked_based_recommend),
    path('all_vod_contents/', views.all_vod_contents),
]

from django.urls import path
from . import views

urlpatterns = [
    path('subgenres/', views.get_subgenres, name='get_subgenres'),
    path('sample_contents/', views.sample_contents_by_genre, name='sample_contents_by_genre'),
    path('subgenre_based_recommend/', views.subgenre_based_recommend),
    path('liked_based_recommend/', views.liked_based_recommend),
    path('all_vod_contents/', views.all_vod_contents),
    path('save_watch_history/', views.save_watch_history),
    path('watch_history/<int:profile_id>/', views.watch_history_by_profile),
    path('genres_with_subgenres/', views.get_genres_with_subgenres, name='get_genres_with_subgenres'),
    path("api/live_by_broadcaster/", views.live_contents_by_broadcaster, name="live_by_broadcaster")

]

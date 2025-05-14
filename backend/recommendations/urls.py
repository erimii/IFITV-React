from django.urls import path
from . import views

urlpatterns = [
    path('subgenres/', views.get_subgenres, name='get_subgenres'),
    path('contents/', views.get_filtered_contents, name='get_filtered_contents'),
    path('preview_contents/', views.preview_contents_grouped, name='preview_contents_grouped'),  # ★ 추가 ★
]

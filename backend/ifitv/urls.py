from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from profiles.views import ProfileViewSet, add_profile, delete_profile
from users.views import signup, login
from recommendations.views import profile_recommend, initial_recommend, recommend_with_detail, live_recommend, preview_recommend_model

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signup/', signup),
    path('api/login/', login),
    path('api/add_profile/', add_profile),
    path('api/delete_profile/', delete_profile),
    path('api/profile_recommend/', profile_recommend),
    path('api/initial_recommend/', initial_recommend),
    path('api/recommend_with_detail/', recommend_with_detail),
    path('api/live_recommend/', live_recommend),
    path('api/preview_recommend_model/', preview_recommend_model),
    path('api/', include(router.urls)),
]

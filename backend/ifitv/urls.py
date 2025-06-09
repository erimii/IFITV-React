from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from profiles.views import ProfileViewSet, add_profile, delete_profile, get_my_list, toggle_like
from users.views import signup, login
from recommendations.views import recommend_with_detail, live_recommend

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signup/', signup),
    path('api/login/', login),
    path('api/add_profile/', add_profile),
    path('api/delete_profile/', delete_profile),
    path('api/my_list/', get_my_list),
    path('api/toggle_like/', toggle_like),
    path('api/recommend_with_detail/', recommend_with_detail),
    path('api/live_recommend/', live_recommend),
    path('recommendation/', include('recommendations.urls')),
    path('api/', include(router.urls)),
]

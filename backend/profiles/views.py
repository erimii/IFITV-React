from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
import json


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        username = request.query_params.get('username')
        if not username:
            return Response({"error": "username 파라미터가 필요합니다."}, status=400)

        profiles = Profile.objects.filter(user__username=username)
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)

@api_view(['POST'])
def add_profile(request):
    username = request.data.get('username')
    profile_data = request.data.get('profile')

    if not username or not profile_data:
        return Response({"error": "username과 profile 데이터는 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "사용자를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    # 문자열이면 json.loads 해주기
    preferred_genres = profile_data.get('preferred_genres', [])
    if isinstance(preferred_genres, str):
        preferred_genres = json.loads(preferred_genres)

    liked_contents = profile_data.get('liked_contents', [])
    if isinstance(liked_contents, str):
        liked_contents = json.loads(liked_contents)

    # 프로필 생성
    profile = Profile.objects.create(
        user=user,
        name=profile_data.get('name'),
        age=profile_data.get('age'),
        gender=profile_data.get('gender'),
        preferred_genres=preferred_genres,
        liked_contents=liked_contents
    )

    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
@api_view(['POST'])
def delete_profile(request):
    username = request.data.get('username')
    profile_name = request.data.get('profile_name')

    if not username or not profile_name:
        return Response({"error": "username과 profile_name은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "사용자를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    deleted, _ = Profile.objects.filter(user=user, name=profile_name).delete()

    if deleted == 0:
        return Response({"error": "해당 프로필을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": "프로필 삭제 완료"}, status=status.HTTP_200_OK)
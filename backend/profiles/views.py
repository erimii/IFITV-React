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


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from profiles.models import Profile, ProfilePreferredSubgenre, ProfileLikedContent
from contents.models import Content, Subgenre

@api_view(['POST'])
def add_profile(request):
    username = request.data.get('username')
    profile_data = request.data.get('profile')

    print('받은 profile_data:', profile_data)

    if not username or not profile_data:
        return Response({"error": "username과 profile 데이터가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. 사용자 가져오기
        user = User.objects.get(username=username)

        # 2. 프로필 생성
        profile = Profile.objects.create(
            user=user,
            name=profile_data['name'],
            age=profile_data['age'],
            gender=profile_data['gender'],
            preferred_genres=profile_data.get('preferred_genres', {}),
            liked_contents=profile_data.get('liked_contents', [])
        )

        # 3. 선호 서브장르 연결 (profile_preferred_subgenres)
        preferred_subgenres = profile_data.get('preferred_subgenres', [])
        for subgenre_id in preferred_subgenres:
            subgenre_obj = Subgenre.objects.get(id=subgenre_id)
            print(f'Insert ProfilePreferredSubgenre: profile_id={profile.id}, subgenre_id={subgenre_id}')
            ProfilePreferredSubgenre.objects.create(
                profile=profile,
                subgenre=subgenre_obj
            )

        # 4. 좋아하는 콘텐츠 연결 (profile_liked_contents)
        liked_contents_ids = profile_data.get('liked_contents_ids', [])
        for content_id in liked_contents_ids:
            content_obj = Content.objects.get(id=content_id)
            ProfileLikedContent.objects.create(
                profile=profile,
                content=content_obj
            )


        return Response({"message": "프로필 생성 및 연결 완료!"}, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({"error": "해당 username의 User가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"프로필 생성 오류: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Profile
from .serializers import ProfileSerializer
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.decorators import api_view
from profiles.models import Profile, ProfilePreferredSubgenre, ProfileLikedVODContent
from contents.models import VodContent, Subgenre
import numpy as np
import pickle

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id 파라미터가 필요합니다."}, status=400)

        profiles = Profile.objects.filter(user__id=user_id)
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)

# 프로필 추가
@api_view(['POST'])
def add_profile(request):
    user_id = request.data.get('user_id')
    profile_data = request.data.get('profile')
    print("전체 request.data:", request.data)

    print('받은 profile_data:', profile_data)

    if not user_id or not profile_data:
        return Response({"error": "user_id과 profile 데이터가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. 사용자 가져오기
        user = User.objects.get(id=user_id)

        # 2. 프로필 생성
        profile = Profile.objects.create(
            user=user,
            name=profile_data['name'],
            age=profile_data['age'],
            gender=profile_data['gender'],
            gesture = profile_data['gesture'],
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
            content_obj = VodContent.objects.get(id=content_id)
            ProfileLikedVODContent.objects.create(
                profile=profile,
                content=content_obj
            )


        return Response({"message": "프로필 생성 및 연결 완료!"}, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({"error": "해당 user_id의 User가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"프로필 생성 오류: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 프로필 삭제
@api_view(['POST'])
def delete_profile(request):
    user_id = request.data.get('user_id')
    profile_name = request.data.get('profile_name')

    if not user_id or not profile_name:
        return Response({"error": "user_id과 profile_name은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "사용자를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    deleted, _ = Profile.objects.filter(user=user, name=profile_name).delete()

    if deleted == 0:
        return Response({"error": "해당 프로필을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": "프로필 삭제 완료"}, status=status.HTTP_200_OK)

# 프로필 수정
@api_view(["PATCH"])
def edit_profile(request):
    user_id = request.data.get("user_id")
    original_name = request.data.get("original_name")
    updated = request.data.get("updated")

    profile = Profile.objects.filter(user__id=user_id, name=original_name).first()
    if not profile:
        return Response({"error": "프로필이 존재하지 않음"}, status=404)

    profile.name = updated.get("name", profile.name)
    profile.age = updated.get("age", profile.age)
    profile.gender = updated.get("gender", profile.gender)
    profile.gesture = updated.get("gesture", profile.gesture)

    profile.save()
    return Response({"message": "수정 완료"})


# my list 불러오기
@api_view(['GET'])
def get_my_list(request):
    profile_id = request.GET.get('profile_id')
    liked_contents = ProfileLikedVODContent.objects.filter(profile_id=profile_id).select_related('content')
    data = [
        {
            'id': item.content.id,
            'title': item.content.title,
            'thumbnail': item.content.thumbnail,
            'description': item.content.description,
        }
        for item in liked_contents
    ]
    return JsonResponse(data, safe=False)

# 좋아요 기능
@api_view(['POST'])
def toggle_like(request):
    profile_id = request.data.get('profile_id')
    content_id = request.data.get('content_id')

    try:
        profile = Profile.objects.get(id=profile_id)
        content = VodContent.objects.get(id=content_id)

        liked, created = ProfileLikedVODContent.objects.get_or_create(profile=profile, content=content)

        if not created:
            liked.delete()
            return JsonResponse({'status': 'removed'})
        else:
            return JsonResponse({'status': 'added'})

    except Profile.DoesNotExist:
        return JsonResponse({'error': 'Invalid profile'}, status=400)
    except VodContent.DoesNotExist:
        return JsonResponse({'error': 'Content not found'}, status=404)

# 손인식
@api_view(['POST'])
def predict_gesture(request):
    joints = request.data.get("joints")
    if not joints:
        return Response({"error": "joints 값이 필요합니다."}, status=400)

    try:
        joint = np.array(joints)
        v1 = joint[[0,1,2,3,0,5,6,7,0,9,10,11,0,13,14,15,0,17,18,19], :]
        v2 = joint[[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], :]
        v = v2 - v1
        v = v / np.linalg.norm(v, axis=1)[:, np.newaxis]

        angle = np.arccos(np.einsum('nt,nt->n',
                    v[[0,1,2,4,5,6,8,9,10,12,13,14,16,17,18],:], 
                    v[[1,2,3,5,6,7,9,10,11,13,14,15,17,18,19],:]))
        angle = np.degrees(angle)
        X_pred = np.array([angle], dtype=np.float32)

        with open("model/knn_model.pkl", "rb") as f:
            knn = pickle.load(f)
        gesture_index = int(knn.predict(X_pred)[0])
        rsp = {0:'rock', 5 : 'paper', 9: 'scissors', 10:'ok'}
        result = rsp.get(gesture_index, "unknown")
        return Response({"result": result})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

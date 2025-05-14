from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from profiles.models import Profile
from recommend_model import hybrid_recommend_with_reason, df
import random
import pandas as pd
from utils import load_today_programs, is_future_program
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from contents.models import Content
from .constants import subgenre_mapping
from django.db.models import Q



# 장르에 해당하는 서브장르 가져오기
def get_subgenres(request):
    if request.method == 'GET':
        return JsonResponse(subgenre_mapping, safe=False)

# 장르 + 서브장르에 해당하는 컨텐츠 가져오기
@api_view(['POST'])
def get_filtered_contents(request):
    data = request.data
    selected = data.get('selected', {})

    print("selected 데이터:", selected)


    contents = Content.objects.none()

    for genre, subgenres in selected.items():
        if subgenres:
            qs = Content.objects.filter(
                genre=genre,
                subgenres__name__in=subgenres
            ).distinct()
            print(f"장르: {genre} / 서브장르: {subgenres} / 결과 개수: {qs.count()}")
            contents = contents.union(qs)

    contents_list = list(contents.values(
        'id', 'title', 'genre', 'description', 'cast', 'age_rating', 'thumbnail'
    ))

    print(f"최종 콘텐츠 개수: {contents.count()}")


    return Response(contents_list)

# 장르/서브장르 별 콘텐츠 출력
@api_view(['POST'])
def preview_contents_grouped(request):
    selected = request.data.get('selected', {})

    if not selected:
        return Response({"error": "selected가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    contents_by_genre = {}

    for genre, subgenres in selected.items():
        if subgenres:
            qs = Content.objects.filter(
                genre=genre,
                subgenres__name__in=subgenres
            ).distinct().order_by('?')[:10]  # 랜덤 10개 샘플링
            contents_by_genre[genre] = list(qs.values(
                'id', 'title', 'genre', 'description', 'cast', 'age_rating', 'thumbnail'
            ))
        else:
            contents_by_genre[genre] = []  # 서브장르 없으면 빈 리스트

    return Response(contents_by_genre)

 
# 선호 장르 기반 콘텐츠 추천
@api_view(['POST'])
def profile_recommend(request):
    username = request.data.get('username')
    profile_name = request.data.get('profile_name')

    if not username or not profile_name:
        return Response({"error": "username과 profile_name은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user, name=profile_name)
    except User.DoesNotExist:
        return Response({"error": "사용자를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
    except Profile.DoesNotExist:
        return Response({"error": "프로필을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    preferred_genres = profile.preferred_genres

    filtered_df = df[df["subgenre"].apply(
        lambda sg: any(genre in sg for genre in preferred_genres)
    )]

    if filtered_df.empty:
        return Response([], status=status.HTTP_200_OK)

    sample_df = filtered_df[["title", "thumbnail"]].drop_duplicates().sample(
        n=min(10, len(filtered_df)), random_state=42
    )

    return Response(sample_df.to_dict(orient="records"), status=status.HTTP_200_OK)

# 선택한 컨텐츠 기반 추천
@api_view(['POST'])
def initial_recommend(request):
    titles = request.data.get('titles', [])

    if not titles:
        return Response({"error": "titles 리스트가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    recommendations = []
    for title in titles:
        try:
            result_df = hybrid_recommend_with_reason(title, top_n=2)
            recommendations.extend(result_df.to_dict(orient="records"))
        except Exception as e:
            continue

    if not recommendations:
        return Response([], status=status.HTTP_200_OK)

    df_result = pd.DataFrame(recommendations).drop_duplicates(subset="title").fillna("")
    return Response(df_result.to_dict(orient="records"), status=status.HTTP_200_OK)

# 홈에서 컨텐츠 클릭 시 디테일 + 해당 콘텐츠 기반 다른 콘텐츠 추천
@api_view(['POST'])
def recommend_with_detail(request):
    title = request.data.get('title')
    top_n = request.data.get('top_n', 5)
    alpha = request.data.get('alpha', 0.7)

    if not title:
        return Response({"error": "title은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result_df = hybrid_recommend_with_reason(title, top_n=top_n, alpha=alpha)

        # 기준 콘텐츠 정보 가져오기
        from recommend_model import df  # df 로딩 위치 주의
        base = df[df["title"] == title].iloc[0]
        info = {
            "title": base["title"],
            "thumbnail": base.get("thumbnail", ""),
            "description": base.get("description", ""),
            "cast": base.get("cast", ""),
            "age_rating": base.get("age_rating", ""),
            "genre": base.get("genre", ""),
            "subgenre": base.get("subgenre", ""),
        }

        return Response({
            "info": info,
            "recommendations": result_df.to_dict(orient="records")
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 편성표 기반 선호 추천
@api_view(['POST'])
def live_recommend(request):

    username = request.data.get('username')
    profile_name = request.data.get('profile_name')

    if not username or not profile_name:
        return Response({"error": "username과 profile_name은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user, name=profile_name)
    except User.DoesNotExist:
        return Response({"error": "사용자를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
    except Profile.DoesNotExist:
        return Response({"error": "프로필을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    preferred_genres = profile.preferred_genres

    today_programs_df = load_today_programs()

    clean_df = today_programs_df.dropna(subset=["서브장르", "장르"])

    from datetime import datetime
    matched_df = clean_df[
        clean_df["방송 시간"].apply(is_future_program) &
        (
            clean_df["서브장르"].apply(lambda g: any(pg in g for pg in preferred_genres)) |
            clean_df["장르"].apply(lambda g: any(pg in g for pg in preferred_genres))
        )
    ]

    if matched_df.empty:
        return Response([], status=status.HTTP_200_OK)

    result = matched_df[[
        "채널명", "방송 시간", "프로그램명", "장르", "서브장르", "출연진", "설명", "썸네일"
    ]].drop_duplicates().head(10).fillna("")

    return Response(result.to_dict(orient="records"), status=status.HTTP_200_OK)

# 프로필 생성 시 선호 장르 기반 콘텐츠 선택 후 추천
@api_view(['POST'])
def preview_recommend_model(request):
    preferred_genres = request.data.get('preferred_genres', [])

    if not preferred_genres:
        return Response({"error": "preferred_genres 리스트가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. preferred_genres 기준 대표 타이틀 뽑기
    base_titles = []
    for genre in preferred_genres:
        candidates = df[df["subgenre"] == genre]["title"].drop_duplicates()
        if not candidates.empty:
            sampled = candidates.sample(n=min(2, len(candidates)), random_state=random.randint(0, 10000)).tolist()
            base_titles.extend(sampled)

    # 2. 중복 제거 후 최대 5개까지만 사용
    base_titles = list(set(base_titles))[:5]

    # 3. 추천 결과 모으기
    recommended = []
    seen = set()
    for title in base_titles:
        try:
            rec_df = hybrid_recommend_with_reason(title, top_n=5, alpha=0.7)
            for _, row in rec_df.iterrows():
                t = row["title"]
                if t not in seen:
                    recommended.append({
                        "title": t,
                        "thumbnail": row.get("thumbnail", ""),
                        "추천 근거": row.get("추천 근거", "")
                    })
                    seen.add(t)
        except Exception as e:
            print(f"추천 실패: {title} / {e}")
            continue

    # 4. 10개만 반환
    return Response(recommended[:10], status=status.HTTP_200_OK)
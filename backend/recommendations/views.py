from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from profiles.models import Profile, ProfileLikedContent
from recommend_model import hybrid_recommend_with_reason, df
import random
import pandas as pd
from utils import load_today_programs, is_current_or_future_program
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from contents.models import Content, Subgenre
from .constants import subgenre_mapping
from django.db.models import Q
from contents.models import Content 
from django.core.paginator import Paginator

#  VOD 전체 가져오기
def all_contents(request):
    page = int(request.GET.get('page', 1))
    per_page = 30

    contents = Content.objects.all()
    paginator = Paginator(contents, per_page)
    page_obj = paginator.get_page(page)

    data = [
        {
            "title": c.title,
            "description": c.description,
            "thumbnail": c.thumbnail,
            "genre": c.genre,
            "subgenres": [s.name for s in c.subgenres.all()],
        }
        for c in page_obj
    ]
    return JsonResponse({
        "results": data,
        "has_next": page_obj.has_next(),
        "next_page": page + 1 if page_obj.has_next() else None
    })

# 장르에 해당하는 서브장르 가져오기
@api_view(['GET'])
def get_subgenres(request):
    subgenres = Subgenre.objects.all().values('id', 'name', 'genre__name')

    genre_mapping = {}
    for sub in subgenres:
        genre_name = sub['genre__name']
        if genre_name not in genre_mapping:
            genre_mapping[genre_name] = []
        genre_mapping[genre_name].append({
            'id': sub['id'],
            'name': sub['name']
        })

    return Response(genre_mapping)

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

    profile_id = request.data.get("profile_id")

    if not title:
        return Response({"error": "title은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:

        content = Content.objects.filter(title=title).first()

        # 해당 콘텐츠가 찜되어 있는지 확인
        is_liked = ProfileLikedContent.objects.filter(
            profile_id=profile_id,
            content_id=content.id
        ).exists()

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
            "liked": is_liked,
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

    # preferred_genres dict → key + value 리스트로 펼치기
    preferred_genres_dict = profile.preferred_genres
    preferred_genres_list = list(set(
        [k for k in preferred_genres_dict.keys()] +
        [v for values in preferred_genres_dict.values() for v in values]
    ))

    print(f"@@@@@@@@@@@@@2{preferred_genres_list}")

    # 오늘 방송 프로그램 로딩
    today_programs_df = load_today_programs()

    # genre / subgenre 없는 행 제거
    clean_df = today_programs_df.dropna(subset=["subgenre", "genre"]).copy()
    clean_df = clean_df[
        clean_df.apply(lambda row: is_current_or_future_program(row["airtime"], row["runtime"]), axis=1)
    ]

    # genre / subgenre 중 하나라도 매칭되는 프로그램 필터링
    genre_mask = clean_df["genre"].astype(str).apply(lambda g: any(pg in g for pg in preferred_genres_list))
    subgenre_mask = clean_df["subgenre"].astype(str).apply(lambda g: any(pg in g for pg in preferred_genres_list))

    matched_df = clean_df[genre_mask | subgenre_mask]

    if matched_df.empty:
        return Response([], status=status.HTTP_200_OK)

    # 출연진은 아직 없으니 제외하고 반환할 컬럼 변경
    result = matched_df[[
        "airtime", "title", "genre", "subgenre", "desc", "thumbnail"
    ]].drop_duplicates().head(10).fillna("")

    print(result[["title", "thumbnail"]])

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

# profile_id로 좋아요한 콘텐츠 가져와서 장르 별로 묶기
@api_view(['POST'])
def liked_based_recommend(request):
    profile_id = request.data.get('profile_id')

    if not profile_id:
        return Response({"error": "profile_id가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({"error": "해당 profile_id의 Profile이 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)

    # 1. profile_liked_contents에서 content_id 조회
    liked_content_ids = ProfileLikedContent.objects.filter(profile=profile).values_list('content_id', flat=True)

    if not liked_content_ids:
        return Response({"error": "선호 콘텐츠가 없습니다."}, status=status.HTTP_200_OK)

    # 2. contents 테이블에서 title, genre 조회
    contents = Content.objects.filter(id__in=liked_content_ids)

    # 3. genre별로 묶기
    grouped = { "드라마": [], "예능": [], "영화": [] }
    for content in contents:
        if content.genre in grouped:
            grouped[content.genre].append(content.title)

    # 4. genre별 추천 모델 돌리기
    results = { "드라마": [], "예능": [], "영화": [] }
    for genre, titles in grouped.items():
        titles = list(titles)
        print(f"[DEBUG] {genre} titles: {titles}")

        if len(titles) > 0:
            try:
                genre_results = []
                for title in titles:
                    rec_df = hybrid_recommend_with_reason(title, top_n=5)
                    genre_results.extend(rec_df.to_dict(orient="records"))
                
                # 중복 제거하고 넣기
                unique_df = pd.DataFrame(genre_results).drop_duplicates(subset="title").fillna("")
                results[genre] = unique_df.to_dict(orient="records")

            except Exception as e:
                print(f"{genre} 추천 실패: {e}")


    return Response(results, status=status.HTTP_200_OK)

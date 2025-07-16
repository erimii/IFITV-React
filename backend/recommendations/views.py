from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from profiles.models import Profile, ProfileLikedVODContent, ProfilePreferredSubgenre
from recommend_model import multi_title_fast_hybrid_recommend, df, fast_hybrid_recommend
import random
import pandas as pd
from utils import load_today_programs, is_current_or_future_program
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from contents.models import VodContent, Subgenre, Genre, LiveContent
from .constants import subgenre_mapping
from django.db.models import Q
from django.core.paginator import Paginator
from profiles.models import VODWatchHistory
from datetime import date, time, datetime
from collections import defaultdict

#  VOD 전체 가져오기
def all_vod_contents(request):
    page = int(request.GET.get('page', 1))
    per_page = 30
    subgenre_id = request.GET.get('subgenre_id')

    contents = VodContent.objects.all()

    if subgenre_id:
        contents = contents.filter(subgenre__id=subgenre_id).distinct()

    paginator = Paginator(contents, per_page)
    page_obj = paginator.get_page(page)

    data = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "thumbnail": c.thumbnail,
            "genre": c.genre,
            "subgenre": [s.name for s in c.subgenre.all()],
        }
        for c in page_obj
    ]
    return JsonResponse({
        "results": data,
        "has_next": page_obj.has_next(),
        "next_page": page + 1 if page_obj.has_next() else None
    })

# Live 전체 가져오기
@api_view(['GET'])
def live_contents_by_broadcaster(request):
    target_date = date(2025, 7, 12)  # 고정 날짜

    programs = LiveContent.objects.filter(date=target_date).order_by('airtime')

    grouped = defaultdict(list)
    broadcaster_first = {}

    for p in programs:
        if not p.channel:
            continue

        airtime_str = p.airtime.strftime('%H:%M:%S') if p.airtime else ""
        runtime_minutes = p.runtime or 0

        if not is_current_or_future_program(airtime_str, runtime_minutes):
            continue

        # 첫 번째만 is_live True
        is_first = p.channel not in broadcaster_first
        if is_first:
            broadcaster_first[p.channel] = True

        grouped[p.channel].append({
            "id": p.id,
            "channel": p.channel,
            "title": p.title,
            "thumbnail": p.thumbnail,
            "airtime": airtime_str,
            "genre": p.genre,
            "subgenre": p.subgenre,
            "description": p.description,
            "is_live": is_first,
        })

    return Response(grouped, status=200)



# home > vod > genre > subgenre 필터링위한 api
@api_view(['GET'])
def get_genres_with_subgenres(request):
    genres = Genre.objects.prefetch_related('subgenres').all()

    data = [
        {
            "id": genre.id,
            "name": genre.name,
            "subgenres": [
                {
                    "id": sub.id,
                    "name": sub.name
                }
                for sub in genre.subgenres.all()
            ]
        }
        for genre in genres
    ]

    return Response(data)

# 프로필 생성 시 1. 장르에 해당하는 서브장르 가져오기
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

# 프로필 생성시 2. 선호 장르/서브장르 별 콘텐츠 출력
@api_view(['POST'])
def sample_contents_by_genre(request):
    selected = request.data.get('selected', {})

    if not selected:
        return Response({"error": "selected가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    contents_by_genre = {}

    for genre, subgenres in selected.items():
        if subgenres:
            qs = VodContent.objects.filter(
                genre=genre,
                subgenre__name__in=subgenres
            ).distinct().order_by('?')[:10]  # 랜덤 10개 샘플링
            contents_by_genre[genre] = list(qs.values(
                'id', 'title', 'genre', 'description', 'cast', 'age_rating', 'thumbnail'
            ))
        else:
            contents_by_genre[genre] = []  # 서브장르 없으면 빈 리스트

    return Response(contents_by_genre)
 
# 1. 선호 장르 기반 콘텐츠 추천
@api_view(['POST'])
def subgenre_based_recommend(request):
    profile_id = request.data.get('profile_id')
    if not profile_id:
        return Response({"error": "profile_id는 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({"error": "프로필을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    # 선호 서브장르 ID 가져오기
    preferred_ids = ProfilePreferredSubgenre.objects.filter(
        profile=profile
    ).values_list('subgenre_id', flat=True)

    # VOD 콘텐츠 중 선호 서브장르와 매칭되는 콘텐츠
    contents = VodContent.objects.filter(
        subgenre__in=preferred_ids
    ).distinct()

    sampled = random.sample(list(contents), min(10, contents.count()))

    data = [
        {
            "id": c.id,
            "title": c.title,
            "thumbnail": c.thumbnail,
        }
        for c in sampled
    ]

    return Response(data)

# 2. 편성표 기반 선호 추천
@api_view(['POST'])
def live_recommend(request):
    profile_id = request.data.get('profile_id')

    if not profile_id:
        return Response({"error": "profile_id는 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({"error": "프로필을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    # 선호 서브장르 기반
    preferred_subgenres = profile.preferred_subgenres.all()
    preferred_names = set([s.name for s in preferred_subgenres] + [s.genre.name for s in preferred_subgenres])

    # 해당 날짜의 편성표 불러오기
    target_date = date(2025, 7, 12)

    # 프로그램 필터링
    programs = LiveContent.objects.filter(date=target_date)

    matched = []
    for program in programs:
        airtime_str = program.airtime.strftime('%H:%M:%S') if program.airtime else ""
        runtime_minutes = program.runtime or 0

        # 🔥 방송 중이거나 예정된 경우에만
        if not is_current_or_future_program(airtime_str, runtime_minutes):
            continue

        # 장르 비교
        subgenre_names = program.subgenre.split(',') if program.subgenre else []
        genre_names = program.genre.split(',') if program.genre else []

        if any(name.strip() in preferred_names for name in subgenre_names + genre_names):
            matched.append({
                "title": program.title,
                "airtime": airtime_str,
                "genre": ", ".join(genre_names),
                "subgenre": ", ".join(subgenre_names),
                "desc": program.description or "",
                "thumbnail": program.thumbnail or "",
            })
    print(f"프로그램 개수: {len(programs)}")
    print(f"선호 장르: {preferred_names}")
    print(f"최종 추천 개수: {len(matched)}")


    return Response(matched[:10], status=status.HTTP_200_OK)

# 3. 좋아요한 콘텐츠 가져와서 추천 모델 돌리기(장르 별 추천 콘텐츠 나옴)
import time
@api_view(['POST'])
def liked_based_recommend(request):
    start = time.time()
    profile_id = request.data.get('profile_id')

    if not profile_id:
        return Response({"error": "profile_id가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({"error": "해당 profile_id의 Profile이 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)

    # profile_liked_contents에서 content_id 조회
    liked_content_ids = ProfileLikedVODContent.objects.filter(profile=profile).values_list('content_id', flat=True)

    if not liked_content_ids:
        return Response({"error": "선호 콘텐츠가 없습니다."}, status=status.HTTP_200_OK)

    # contents 테이블에서 title, genre 조회
    contents = VodContent.objects.filter(id__in=liked_content_ids)

    # genre별로 묶기
    grouped = { "드라마": [], "예능": [], "영화": [] }
    for content in contents:
        if content.genre in grouped:
            grouped[content.genre].append(content.title)

    # genre별 추천 모델 돌리기
    results = { "드라마": [], "예능": [], "영화": [] }

    for genre, titles in grouped.items():
        titles = list(titles)
        print(f"[DEBUG] {genre} titles: {titles}")

        if len(titles) > 0:
            try:
                rec_df = multi_title_fast_hybrid_recommend(titles, top_n=10)
                unique_df = rec_df.drop_duplicates(subset="title").fillna("")
                results[genre] = unique_df.to_dict(orient="records")
            except Exception as e:
                print(f"{genre} 추천 실패: {e}")
    end = time.time()
    print(f"[TIME] liked_based_recommend took {end - start:.2f} seconds")
    return Response(results, status=status.HTTP_200_OK)

# 컨텐츠 클릭 시 디테일 + 해당 콘텐츠 기반 다른 콘텐츠 추천(모달에서)
@api_view(['POST'])
def recommend_with_detail(request):
    title = request.data.get('title')
    top_n = request.data.get('top_n', 5)
    alpha = request.data.get('alpha', 0.7)

    profile_id = request.data.get("profile_id")

    if not title:
        return Response({"error": "title은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        content = VodContent.objects.filter(title=title).first()

        # 해당 콘텐츠가 찜되어 있는지 확인
        is_liked = ProfileLikedVODContent.objects.filter(
            profile_id=profile_id,
            content_id=content.id
        ).exists()

        result_df = fast_hybrid_recommend(title, top_n=top_n, alpha=alpha)

        # 기준 콘텐츠 정보 가져오기
        from recommend_model import df  # df 로딩 위치 주의
        base = df[df["title"] == title].iloc[0]
        info = {
            "id": int(base["id"]),
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

# 시청기록 저장
@api_view(['POST'])
def save_watch_history(request):
    print("[DEBUG] request.data:", request.data) 
    profile_id = request.data.get("profile_id")
    content_id = request.data.get("content_id")
    duration = request.data.get("duration")

    if not profile_id or not content_id:
        return Response({"error": "profile_id와 content_id는 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = Profile.objects.get(id=profile_id)
        content = VodContent.objects.get(id=content_id)
    except Profile.DoesNotExist:
        return Response({"error": "해당 프로필이 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
    except VodContent.DoesNotExist:
        return Response({"error": "해당 콘텐츠가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)

    VODWatchHistory.objects.create(
        profile=profile,
        content=content,
        duration=duration
    )

    return Response({"message": "시청 기록 저장 완료"}, status=status.HTTP_201_CREATED)

# 특정 프로필의 시청한 콘텐츠 목록을 반환
@api_view(['GET'])
def watch_history_by_profile(request, profile_id):
    watched = VODWatchHistory.objects.filter(profile_id=profile_id).values_list('VOD_content_id', flat=True)
    return Response(list(watched), status=status.HTTP_200_OK)



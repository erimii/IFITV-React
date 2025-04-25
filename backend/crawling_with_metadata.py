import re
import time
import html
import requests
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By

# 장르 변환 맵
genre_map = {'연예/오락': '예능', '뉴스/정보': '보도', '만화': '애니'}

# 서브장르 추정 키워드
desc_keywords = {
    '해외드라마': ['해외드라마', '외국 드라마', '외화'],
    '미국드라마': ['미국 드라마', '할리우드'],
    '영국드라마': ['영국 드라마', 'BBC'],
    '중국드라마': ['중국 드라마', '중드'],
    '일본드라마': ['일본 드라마', '일드'],
    '로맨스': ['사랑', '연애', '로맨스', '멜로'],
    '코미디': ['코미디', '유쾌', '웃음'],
    '판타지': ['마법', '초능력', '이세계', '판타지'],
    '무협': ['무협', '검술', '강호'],
    '공포': ['공포', '호러', '귀신'],
    '복수': ['복수', '보복'],
    '휴먼': ['인간 드라마', '가족사', '감동'],
    '범죄 스릴러_수사극': ['수사', '스릴러', '형사', '범죄'],
    '의학': ['병원', '의사', '의학', '의료'],
    '웹툰_소설 원작': ['웹툰 원작', '소설 원작', '동명 웹툰'],
    '정치_권력': ['정치', '권력', '국회'],
    '법정': ['법정', '변호사', '재판'],
    '청춘': ['청춘', '대학생', '캠퍼스'],
    '오피스 드라마': ['직장', '회사', '오피스'],
    '사극_시대극': ['조선', '왕', '궁', '사극', '역사극'],
    '타임슬립': ['타임슬립', '시간 여행'],

    '버라이어티': ['버라이어티', '다양한 코너', '재미'],
    '다큐멘터리': ['다큐멘터리', '기록', '르포'],
    '여행': ['여행', '관광', '투어'],
    '쿡방/먹방': ['요리', '쿡', '먹방', '맛집'],
    '연애리얼리티': ['연애 리얼리티', '소개팅', '연애 프로그램'],
    '게임': ['게임', 'e스포츠'],
    '토크쇼': ['토크쇼', '인터뷰', '대화'],
    '서바이벌': ['서바이벌', '오디션'],
    '관찰리얼리티': ['관찰', '리얼리티', '일상 공개'],
    '스포츠예능': ['스포츠 예능', '운동 예능'],
    '교육예능': ['교육 예능', '공부 예능', '지식 전달'],
    '힐링예능': ['힐링 예능', '자연 예능', '휴식'],
    '아이돌': ['아이돌', 'K-POP'],
    '음악서바이벌': ['음악 서바이벌', '보컬 배틀'],
    '음악예능': ['음악 예능', '노래 예능'],
    '가족예능': ['가족 예능', '가족 리얼리티'],
    '코미디': ['개그', '웃음 예능'],
    '뷰티': ['뷰티', '화장', '메이크업'],
    '애니멀': ['동물 프로그램', '반려동물'],
    '교양': ['교양 프로그램', '지식', '정보 전달'],

    '드라마': ['영화 드라마', '감동 실화'],
    '로맨스': ['영화 로맨스', '사랑 이야기'],
    '코미디': ['영화 코미디'],
    '애니메이션': ['극장판 애니', '애니메이션 영화'],
    '스릴러': ['스릴러 영화', '공포 스릴러'],
    '미스터리': ['미스터리 영화', '추리'],
    '모험': ['모험 영화', '여정'],
    '액션': ['액션 영화', '전투'],
    '판타지 (영화)': ['판타지 영화'],
    'SF': ['SF 영화', '과학 판타지'],
    '공포': ['공포 영화'],
    '다큐멘터리': ['다큐 영화'],

    '키즈': ['아이들', '어린이', '키즈', '아동용', '동요']
}

def guess_subgenre_by_desc(desc):
    for subgenre, keywords in desc_keywords.items():
        for keyword in keywords:
            if keyword in desc:
                return subgenre
    return ''

def get_program_metadata(program_name, driver, client_id, client_secret, original_genre):
    def get_naver_program_info(name):
        url = "https://openapi.naver.com/v1/search/webkr.json"
        headers = {
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret
        }
        params = {"query": name, "display": 3}
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                items = response.json().get("items", [])
                if items:
                    item = items[0]
                    description = re.sub(r'<[^>]+>', '', item.get("description", "").strip())
                    link = item.get("link", "").strip()
                    cast_match = re.search(r'(출연[진자]?[\s]*[:：]?[\s]*)([^,\.]{2,}(,\s*[^,\.]{2,})*)', description)
                    cast = cast_match.group(2).strip() if cast_match else ''
                    return description, cast, link
        except Exception as e:
            print(f"[OpenAPI 오류] '{name}' 검색 중 예외 발생: {e}")
        return '', '', ''

    def get_info_from_web_search(name):
        query = f"{name} 정보"
        driver.get(f"https://search.naver.com/search.naver?query={query}")
        time.sleep(1.5)

        try:
            genre = driver.find_element(By.CSS_SELECTOR, "dl.info_group dd").text.strip()
        except:
            genre = ''

        try:
            desc = driver.find_element(By.CSS_SELECTOR, "div.intro_box p").text.strip()
        except:
            desc = ''

        try:
            thumbnail = driver.find_element(
                By.CSS_SELECTOR,
                '#main_pack div[class*="_broadcast_button_scroller"] div.cm_content_wrap._broadcast_normal_total > div:nth-child(1) div.detail_info a img'
            ).get_attribute("src")
        except:
            thumbnail = ''

        return genre, desc, thumbnail

    web_genre, web_desc, thumbnail = get_info_from_web_search(program_name)
    desc, cast, link = web_desc, '', ''
    sub_genre = genre_map.get(web_genre, web_genre)

    if not desc or len(desc) < 20:
        print(f"[보완 검색] 웹 설명 부족 → OpenAPI 시도: {program_name}")
        api_desc, api_cast, api_link = get_naver_program_info(program_name)
        if len(api_desc) > len(desc):
            desc = api_desc
        cast = api_cast or cast

    desc = html.unescape(desc)

    if sub_genre in ['', '정보', '기타']:
        guessed = guess_subgenre_by_desc(desc)
        if guessed:
            sub_genre = guessed

    if original_genre == '보도':
        sub_genre = '보도'

    return original_genre, sub_genre, desc, cast, thumbnail


# IFITV 예능 추천기 (React + Django  연동)

티빙 예능 콘텐츠 기반의 맞춤형 추천 시스템입니다.

React 프론트엔드와 Django 백엔드를 사용하여 멀티 프로필 기반 맞춤형 콘텐츠 추천을 제공합니다.

---

## 🚀 주요 기능

### React 프론트엔드
- 회원가입 / 로그인 / 멀티프로필 기능 추가
- 프로필 선택 → 홈 진입 → 맞춤형 추천 흐름 구현
- 선호 장르 기반 추천 콘텐츠 리스트
- 실시간 방송 편성표 기반 추천
- 프로필에서 선택한 콘텐츠를 기반으로 장르별 추천 (드라마/예능/영화) 추가
- 콘텐츠 클릭 시 상세 정보 + 비슷한 콘텐츠 추천 모달

### Django 백엔드 (DRF 기반)
- /api/signup, /api/login: 사용자 인증 및 프로필 관리 (DB 연동)
- /api/add_profile: 사용자별 멀티 프로필 등록 (장르/나이/성별 등)
- /api/profile_recommend: 프로필 선호 장르 기반 추천 콘텐츠 반환
- /api/live_recommend: 실시간 방송 편성표 기반 추천
- /api/preview_recommend_model: 프로필 생성 시 장르 기반 대표 콘텐츠 추천
- /api/initial_recommend: 대표 콘텐츠 기반 초기 추천
- /api/recommend_with_detail: 선택 콘텐츠 상세 정보 및 유사 콘텐츠 추천
- /recommendation/liked_based_recommend: profile_liked_contents 기반 장르별 추천 (드라마/예능/영화)
- Subgenre/Content 매핑 테이블 관리 및 실시간 연동 (genres / subgenres / profile_liked_contents 구조 개선)

---

## 추천 알고리즘

- TF-IDF 기반 유사도: 콘텐츠 설명 벡터화
- KoBERT 문장 임베딩 기반 유사도: 의미 기반 유사도 측정
- 하이브리드 결합: α * TFIDF + (1-α) * KoBERT
- Boosting 가중치 적용: 장르, 서브장르, 출연진, 설명 키워드가 겹칠 경우 가중치 적용
- 추천 근거 출력: 유사 콘텐츠와의 키워드 겹침 근거 반환

## 기술 스택
- Frontend: React, React Router, 
- Backend: Django, Django REST Framework
- Database: SQLite → (MySQL/PostgreSQL 전환 예정)
- ML/NLP: scikit-learn TF-IDF, KoBERT, pandas

## 최근 업데이트 (2025.05)
- 멀티 프로필 구조 개선 (profile_preferred_subgenres, profile_liked_contents 테이블 연동)
- liked_contents 기반 장르별 추천 API 추가 (드라마/예능/영화 별 추천)
- frontend HomePage 구조 개선 (추천 영역별 HorizontalSlider 컴포넌트화)
- 추천 모델 중복 호출 최적화
- 전체 DB foreign key 구조 리팩토링 완료


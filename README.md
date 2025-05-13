
# IFITV 예능 추천기 (React + Django  연동)

📺 티빙 예능 콘텐츠 기반의 맞춤형 추천 시스템입니다.  
React 프론트엔드와 Django 백엔드를 사용하여 멀티 프로필 기반 맞춤형 콘텐츠 추천을 제공합니다.
---

## 🚀 주요 기능

### 🎨 React 프론트엔드
- 회원가입 / 로그인 / 멀티프로필 기능 추가
- 프로필 선택 → 홈 진입 → 맞춤형 추천 흐름 구현
- 선호 장르 기반 추천 콘텐츠 리스트
- 실시간 방송 편성표 기반 추천
- 콘텐츠 클릭 시 상세 정보 + 비슷한 콘텐츠 추천 모달

### 🧠 🐍 Django 백엔드 (DRF 기반)
- /api/signup, /api/login: 사용자 인증 및 프로필 관리 (DB 연동)
- /api/add_profile: 사용자별 멀티 프로필 등록 (장르/나이/성별 등)
- /api/profile_recommend: 프로필 선호 장르 기반 추천 콘텐츠 반환
- /api/live_recommend: 실시간 방송 편성표 기반 추천
- /api/preview_recommend_model: 프로필 생성 시 장르 기반 대표 콘텐츠 추천
- /api/initial_recommend: 대표 콘텐츠 기반 초기 추천
- /api/recommend_with_detail: 선택 콘텐츠 상세 정보 및 유사 콘텐츠 추천

---

## 🧠 추천 알고리즘

- TF-IDF 기반 유사도: 콘텐츠 설명 벡터화
- KoBERT 문장 임베딩 기반 유사도: 의미 기반 유사도 측정
- 하이브리드 결합: α * TFIDF + (1-α) * KoBERT
- Boosting: 장르, 서브장르, 출연진, 설명 키워드가 겹칠 경우 가중치 적용
- 추천 근거 출력: 유사 콘텐츠와의 키워드 겹침 근거 반환

## 🛠️ 기술 스택
- Frontend: React, React Router, 
- Backend: Django, Django REST Framework
- Database: SQLite → (MySQL/PostgreSQL 전환 예정)
- ML/NLP: scikit-learn TF-IDF, KoBERT, pandas




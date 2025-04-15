
# IFITV 예능 추천기 (React + Flask 연동)

📺 티빙 예능 콘텐츠 기반의 맞춤형 추천 시스템입니다.  
React 프론트엔드와 Flask 백엔드를 사용하여 콘텐츠를 선택하면 유사한 콘텐츠를 추천합니다.

---

## 📁 프로젝트 구조
'''
IFITV-React/
├── backend/                # Flask 백엔드
│   ├── app.py              # 추천 API 라우터
│   ├── recommend_model.py  # 추천 모델 (TF-IDF + KoBERT)
│   └── tving_entertainment_all_merged.csv
│
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   └── App.js          # 썸네일 클릭 + 추천 결과 렌더링
│   └── public/
│
├── README.md
└── .gitignore
'''
---

## 🚀 주요 기능

### 🎨 React 프론트엔드
- 콘텐츠 썸네일 카드 UI
- 콘텐츠 클릭 시 추천 요청 전송
- 추천 결과 리스트 + 추천 근거 출력

### 🧠 Flask 백엔드
- `/titles_with_thumbnails`: 콘텐츠 + 썸네일 리스트 반환
- `/recommend`: 콘텐츠명 기반 추천 결과 반환
- TF-IDF + KoBERT 기반 하이브리드 추천 모델 사용

---

## 🧠 추천 방식

- TF-IDF 기반 콘텐츠 유사도 계산
- KoBERT 문장 임베딩 기반 의미 유사도 계산
- 하이브리드 추천: `α * TFIDF + (1-α) * KoBERT`
- 장르 겹침 수로 Boosting 적용
- 추천 이유: 장르, 출연진, 설명 키워드 겹침 정보 제공



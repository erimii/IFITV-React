
# IFITV 예능 추천기 (React + Django 연동)

티빙 예능 콘텐츠 기반의 맞춤형 추천 시스템입니다.
React 프론트엔드와 Django 백엔드를 사용하여 **멀티 프로필**, **실시간 방송 추천**, **콘텐츠 기반 유사 추천**, **제스처 인식 기반 자동 로그인** 기능 등을 제공합니다.

---

## 주요 기능

### ✅ 프론트엔드 (React)

* 회원가입 / 로그인 기능
* 멀티 프로필 생성 및 선택
* 키보드 기반 전역 포커스 네비게이션 지원 (TV 리모컨 UX)

  * 방향키를 통한 포커스 이동
  * Enter로 선택
* 프로필 생성 시 선호 장르 선택
* 대표 콘텐츠 기반 초기 추천 (SelectContentPage)
* Home 진입 시 맞춤형 추천 콘텐츠 표시
* 실시간 방송 편성표 기반 추천
* 콘텐츠 클릭 시 상세 정보 + 유사 콘텐츠 모달 표시
* 모달 내 추천 콘텐츠 탐색 및 재선택 가능
* Skeleton UI, Section Slider, Flyout Sidebar 등 최신 UI 구성

### ✅ 백엔드 (Django REST Framework)

* 사용자 인증: `/api/signup`, `/api/login`
* 멀티 프로필 등록: `/api/add_profile`
* 프로필 기반 추천 API:

  * `/api/profile_recommend`: 선호 장르 기반 추천
  * `/api/initial_recommend`: 대표 콘텐츠 기반 초기 추천
  * `/api/recommend_with_detail`: 선택 콘텐츠 유사 추천
* 실시간 방송 추천: `/api/live_recommend`
* 시청/좋아요 기록: `/recommendation/watch_history/`, `/api/my_list/`

---

## ✋ 제스처 인식 기반 프로필 자동 전환

* 카메라로 손 모양 인식 후 등록된 프로필과 자동 매칭
* GestureModal을 통한 시각적 피드백 제공
* 인식된 손 제스처에 따라 프로필 선택 → Home 자동 진입
* 전역 Context로 관리 (`GestureModalContext`)
* UX 흐름:
  진입 → 손 제스처 인식 → 프로필 자동 선택 → Home 진입

---

## 추천 알고리즘

* **TF-IDF 기반 유사도**: 콘텐츠 설명을 벡터화하여 계산
* **KoBERT 기반 의미 유사도**: 콘텐츠 설명을 임베딩하여 의미 유사도 계산
* **하이브리드 결합**:
  `α * TF-IDF 유사도 + (1 - α) * KoBERT 유사도`
* **Boosting**: 장르, 서브장르, 출연진, 설명 키워드 겹침 가중치 적용
* **추천 근거 설명**: 유사 콘텐츠와 겹친 키워드 근거 반환

---

## 키보드 기반 전역 네비게이션

* FocusContext로 방향키 기반 탐색 상태 전역 관리
* Focusable 컴포넌트로 각 요소 포커싱 제어
* 모든 페이지에서 키보드로만 콘텐츠 탐색 및 선택 가능
* 슬라이더, 서브장르 해시태그, 추천 콘텐츠, 모달 등 전 구역 적용
* 예외 처리: form input, modal 내 복귀 포커스 등 세밀하게 구현

---

## 기술 스택

| 영역            | 기술                                                 |
| ------------- | -------------------------------------------------- |
| **Frontend**  | React, React Router, Context API, CSS Module       |
| **Backend**   | Django, Django REST Framework                      |
| **Database**  | MySQL                                              |
| **ML/NLP**    | scikit-learn TF-IDF, KoBERT (transformers), pandas |
| **AI Vision** | TensorFlow\.js, MediaPipe (제스처 인식)                 |

---

## 시연 영상




https://github.com/user-attachments/assets/a7e05351-7a1d-4ac1-8ad7-2c2e1f0056d3





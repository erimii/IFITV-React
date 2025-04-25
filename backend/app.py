# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

from recommend_model import hybrid_recommend_with_reason, df
from utils import load_today_programs, is_future_program
from user_profiles import load_profiles

app = Flask(__name__)
CORS(app)

# CSV에서 오늘 방송 불러오기
today_programs_df = load_today_programs()

# 편성표 기반 선호 추천
@app.route("/live_recommend", methods=["POST"])
def live_recommend():
    data = request.get_json()
    username = data["username"]
    profile_name = data["profile_name"]

    try:
        profiles = load_profiles()
        for user in profiles:
            if user["username"] == username:
                for p in user.get("profiles", []):
                    if p["name"] == profile_name:
                        preferred_genres = p["preferred_genres"]

                        clean_df = today_programs_df.dropna(subset=["서브장르", "장르"])

                        # 방송 시간이 현재 이후인 콘텐츠만 필터링
                        filtered_df = clean_df[clean_df["방송 시간"].apply(is_future_program)]

                        matched_df = filtered_df[
                            filtered_df["서브장르"].apply(lambda g: any(pg in g for pg in preferred_genres)) |
                            filtered_df["장르"].apply(lambda g: any(pg in g for pg in preferred_genres))
                        ]
                        print(f"매칭된 프로그램 개수: {len(matched_df)}")

                        if matched_df.empty:
                            return jsonify([])

                        result = matched_df[
                            ["채널명", "방송 시간", "프로그램명", "장르", "서브장르", "출연진", "설명", "썸네일"]
                        ].drop_duplicates().head(10)
                        result = result.fillna("")

                        return jsonify(result.to_dict(orient="records"))

        return jsonify({"error": "해당 프로필을 찾을 수 없습니다."}), 404

    except Exception as e:
        print(f"[live_recommend] 오류: {e}")
        return jsonify({"error": str(e)})

# 사용자 프로필 목록 조회
@app.route("/user_profiles/<username>", methods=["GET"])
def get_user_profiles(username):
    profiles = load_profiles()
    for user in profiles:
        if user["username"] == username:
            return jsonify(user.get("profiles", []))  # 없으면 빈 리스트
    return jsonify({"error": "사용자를 찾을 수 없습니다."}), 404

# 프로필 생성 시 선호 장르 기반 콘텐츠 선택 후 추천
@app.route("/preview_recommend_model", methods=["POST"])
def preview_recommend_model():
    data = request.get_json()
    genres = data.get("preferred_genres", [])

    # 선택한 장르별로 2개씩 대표 타이틀 고르기(기준 콘텐츠로 사용)
    base_titles = []
    for genre in genres:
        candidates = df[df["subgenre"] == genre]["title"].drop_duplicates()
        if not candidates.empty:
            import random
            sampled = candidates.sample(n=2, random_state=random.randint(0, 10000)).tolist()
            base_titles.extend(sampled)

    # 중복 제거 후 최대 5개까지만 사용
    base_titles = list(set(base_titles))[:5]

    # 추천 모델 결과 모으기
    recommended = []
    seen = set()
    for title in base_titles:
        try:
            rec_df = hybrid_recommend_with_reason(title, top_n=5, alpha=0.7)
            for _, row in rec_df.iterrows():
                t = row["title"]
                if t not in seen:
                    recommended.append({
                        "title": row["title"],
                        "thumbnail": row.get("thumbnail", ""),
                        "추천 근거": row.get("추천 근거", "")
                    })
                    seen.add(t)
        except:
            continue

    # 10개만 출력
    return jsonify(recommended[:10])

# 선택한 컨텐츠 기반 추천
@app.route("/initial_recommend", methods=["POST"])
def initial_recommend():
    data = request.get_json()
    titles = data.get("titles", [])

    recommendations = []
    for title in titles:
        try:
            result_df = hybrid_recommend_with_reason(title, top_n=2)
            recommendations.extend(result_df.to_dict(orient="records"))
        except:
            continue

    # 중복 제거
    import pandas as pd
    df = pd.DataFrame(recommendations)
    df = df.drop_duplicates(subset="title").fillna("")

    return jsonify(df.to_dict(orient="records"))

# 새 프로필 추가
@app.route("/add_profile", methods=["POST"])
def add_profile():
    data = request.get_json()
    username = data["username"]
    new_profile = data["profile"]

    profiles = load_profiles()
    for user in profiles:
        if user["username"] == username:
            if "profiles" not in user:
                user["profiles"] = []

            # 중복된 프로필 이름 방지
            if any(p["name"] == new_profile["name"] for p in user["profiles"]):
                return jsonify({"error": "이미 존재하는 프로필 이름입니다."}), 400

            user["profiles"].append(new_profile)

            with open("profiles.json", "w", encoding="utf-8") as f:
                json.dump(profiles, f, ensure_ascii=False, indent=2)

            return jsonify(user["profiles"])  # 업데이트된 전체 목록 반환

    return jsonify({"error": "사용자를 찾을 수 없습니다."}), 404

# 프로필 삭제
@app.route("/delete_profile", methods=["POST"])
def delete_profile():
    data = request.get_json()
    username = data["username"]
    profile_name = data["profile_name"]

    profiles = load_profiles()
    for user in profiles:
        if user["username"] == username:
            user["profiles"] = [p for p in user.get("profiles", []) if p["name"] != profile_name]
            with open("profiles.json", "w", encoding="utf-8") as f:
                json.dump(profiles, f, ensure_ascii=False, indent=2)
            return jsonify({"message": "프로필 삭제 완료"})
    
    return jsonify({"error": "사용자 또는 프로필을 찾을 수 없습니다."}), 404


# 회원가입
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    age = data["age"]
    gender = data["gender"]

    profiles = load_profiles()

    # 동일한 닉네임 중복 체크
    if any(p["username"] == username for p in profiles):
        return jsonify({"error": "이미 존재하는 사용자입니다."}), 400

    # 새 사용자 생성
    new_user = {
        "username": username,
        "password": password,
        "age": age,
        "gender": gender,
        "profiles": []
    }

    profiles.append(new_user)

    # JSON 파일에 저장
    with open("profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)

    return jsonify({"message": "회원가입 성공!"})

# 로그인
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    profiles = load_profiles()
    for profile in profiles:
        if profile["username"] == username and profile["password"] == password:
            return jsonify(profile)
    
    return jsonify({"error": "아이디 또는 비밀번호가 일치하지 않습니다."}), 401

# 선호 장르 기반 콘텐츠 추천
@app.route("/profile_recommend", methods=["POST"])
def profile_recommend():
    data = request.get_json()
    username = data["username"]
    profile_name = data["profile_name"]

    try:
        profiles = load_profiles()
        for user in profiles:
            if user["username"] == username:
                for p in user.get("profiles", []):
                    if p["name"] == profile_name:
                        preferred_genres = p["preferred_genres"]

                        filtered_df = df[df["subgenre"].apply(
                            lambda sg: any(genre in sg for genre in preferred_genres)
                        )]

                        if filtered_df.empty:
                            return jsonify([])

                        sample_df = filtered_df[["title", "thumbnail"]].drop_duplicates().sample(
                            n=min(10, len(filtered_df)), random_state=42
                        )
                        return jsonify(sample_df.to_dict(orient="records"))

        return jsonify({"error": "프로필을 찾을 수 없습니다."}), 404

    except Exception as e:
        return jsonify({"error": str(e)})

# 홈에서 컨텐츠 클릭 시 디테일 + 해당 콘텐츠 기반 다른 콘텐츠 추천
@app.route("/recommend_with_detail", methods=["POST"])
def recommend_with_reason():
    data = request.get_json()
    title = data["title"]
    top_n = data.get("top_n", 5)
    alpha = data.get("alpha", 0.7)

    try:
        result_df = hybrid_recommend_with_reason(title, top_n=top_n, alpha=alpha)

        # 기준 콘텐츠 정보 가져오기
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

        return jsonify({
            "info": info,
            "recommendations": result_df.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)

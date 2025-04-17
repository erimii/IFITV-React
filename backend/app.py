# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

from recommend_model import hybrid_recommend_with_reason, df

from user_profiles import get_profile
from user_profiles import load_profiles

app = Flask(__name__)
CORS(app)

# 사용자 프로필 목록 조회
@app.route("/user_profiles/<username>", methods=["GET"])
def get_user_profiles(username):
    profiles = load_profiles()
    for user in profiles:
        if user["username"] == username:
            return jsonify(user.get("profiles", []))  # 없으면 빈 리스트
    return jsonify({"error": "사용자를 찾을 수 없습니다."}), 404


# 사용자에게 새 프로필 추가
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

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    age = data["age"]
    gender = data["gender"]
    preferred_genres = data.get("preferred_genres", [])

    profiles = load_profiles()

    # 동일한 닉네임 중복 체크
    if any(p["username"] == username for p in profiles):
        return jsonify({"error": "이미 존재하는 사용자입니다."}), 400

    # 새 사용자 생성
    new_profile = {
        "username": username,
        "password": password,
        "age": age,
        "gender": gender,
        "preferred_genres": preferred_genres
    }

    profiles.append(new_profile)

    # JSON 파일에 저장
    with open("profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)

    return jsonify({"message": "회원가입 성공!"})

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

@app.route("/profiles", methods=["GET"])
def get_profiles():
    return jsonify(load_profiles())


@app.route("/profile_recommend", methods=["POST"])
def profile_recommend():
    data = request.get_json()
    username = data["username"]
    profile_name = data["profile_name"]

    try:
        profile = get_profile(username)
        preferred_genres = profile["preferred_genres"]

        filtered_df = df[df["subgenre"].apply(
            lambda sg: any(genre in sg for genre in preferred_genres)
        )]
        if filtered_df.empty:
            return jsonify([])
        sample_df = filtered_df[["title", "thumbnail"]].drop_duplicates().sample(n=10, random_state=42)
        return jsonify(sample_df.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route("/recommend_with_reason", methods=["POST"])
def recommend_with_reason():
    data = request.get_json()
    title = data["title"]
    top_n = data.get("top_n", 5)
    alpha = data.get("alpha", 0.7)

    try:
        result_df = hybrid_recommend_with_reason(title, top_n=top_n, alpha=alpha)
        return jsonify(result_df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/titles", methods=["GET"])
def get_titles():
    return jsonify(df["title"].unique().tolist())

if __name__ == "__main__":
    app.run(debug=True)

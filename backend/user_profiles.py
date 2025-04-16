import json

def load_profiles():
    with open("profiles.json", encoding="utf-8") as f:
        return json.load(f)

def get_profile(username):
    profiles = load_profiles()
    for profile in profiles:
        if profile["username"] == username:
            return profile
    raise ValueError("사용자 없음")

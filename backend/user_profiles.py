import json
import os
from django.conf import settings

def load_profiles():
    profiles_path = os.path.join(settings.BASE_DIR, 'backend', 'profiles.json')
    with open(profiles_path, encoding="utf-8") as f:
        return json.load(f)

def get_profile(username):
    profiles = load_profiles()
    for profile in profiles:
        if profile["username"] == username:
            return profile
    raise ValueError("사용자 없음")

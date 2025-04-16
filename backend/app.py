# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS

from recommend_model import hybrid_recommend_with_reason, df, title_to_index

from user_profiles import get_profile

app = Flask(__name__)
CORS(app)

@app.route("/profiles", methods=["GET"])
def get_profiles():
    from user_profiles import load_profiles
    return jsonify(load_profiles())


@app.route("/profile_recommend", methods=["POST"])
def profile_recommend():
    data = request.get_json()
    username = data["username"]

    try:
        profile = get_profile(username)
        preferred_genres = profile["preferred_genres"]

        sample_df = df[df["subgenre"].isin(preferred_genres)]
        sample_df = sample_df[["title", "thumbnail"]].drop_duplicates().sample(n=10, random_state=42)
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

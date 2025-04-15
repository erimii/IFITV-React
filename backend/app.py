# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS

from recommend_model import hybrid_recommend_with_reason, df, title_to_index


app = Flask(__name__)
CORS(app)

@app.route("/recommend", methods=["POST"])
def recommend_api():
    data = request.get_json()
    title = data.get("title", "나는 SOLO")
    top_n = data.get("top_n", 5)
    alpha = data.get("alpha", 0.7)

    print(f"추천 요청 title: {title}, alpha: {alpha}, top_n: {top_n}")

    try:
        result_df = hybrid_recommend_with_reason(title, top_n=top_n, alpha=alpha)
        return jsonify(result_df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/titles", methods=["GET"])
def get_titles():
    return jsonify(df["title"].unique().tolist())

# 썸네일+제목 랜덤 10개만 뜨도록 설정
@app.route("/titles_with_thumbnails", methods=["GET"])
def get_titles_with_thumbnails():
    sample_df = df[["title", "thumbnail"]].drop_duplicates().sample(n=10, random_state=42)
    return jsonify(sample_df.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True)


import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine

from konlpy.tag import Okt
okt = Okt()

from transformers import AutoTokenizer, AutoModel
import torch

# DB에서 contents 테이블 불러오기
def load_contents():
    engine = create_engine('mysql+pymysql://root:rubi@localhost:3306/ifitv_db')
    query = "SELECT * FROM contents"
    df = pd.read_sql(query, con=engine)
    return df

df = load_contents()

# 결측값 채우기
df.fillna("정보 없음", inplace=True)

# 한글 텍스트 → 명사만 추출 + 불용어 필터링 추가
stopwords = {"이", "가", "은", "는", "을", "를", "의", "에", "에서", "으로", "입니다"}

def extract_nouns_filtered(text):
    nouns = okt.nouns(str(text))
    return ' '.join([word for word in nouns if word not in stopwords and len(word) > 1])


# KoBERT 사전학습 모델
tokenizer = AutoTokenizer.from_pretrained("monologg/kobert", trust_remote_code=True)
model = AutoModel.from_pretrained("monologg/kobert", trust_remote_code=True)

def get_kobert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    # [CLS] 토큰의 임베딩 사용 (문장 전체 의미)
    cls_embedding = outputs.last_hidden_state[:, 0, :]
    return cls_embedding.squeeze().numpy()

# 임베딩 파일 체크 → 없으면 생성
if os.path.exists("kobert_embedding_matrix.npy"):
    embedding_matrix = np.load("kobert_embedding_matrix.npy")
else:
    print("KoBERT 임베딩 생성 중...")
    desc_embeddings = []
    for desc in df["description"]:
        try:
            vec = get_kobert_embedding(desc)
        except:
            vec = np.zeros(768)
        desc_embeddings.append(vec)

    embedding_matrix = np.vstack(desc_embeddings)
    np.save("kobert_embedding_matrix.npy", embedding_matrix)
    print("저장 완료: kobert_embedding_matrix.npy")

# 추천 특징 조합 (설명 + 장르+ 서브장르 + 출연진)
df["features"] = df[["description", "genre", "subgenre", "cast"]].apply(
    lambda row: ' '.join([str(x) for x in row if x != "정보 없음"]), axis=1)

# 형태소 분석 적용
df["features_nouns"] = df["features"].apply(extract_nouns_filtered)

# TF-IDF 벡터 생성
'''
min_df=3: 3개 미만 문서에 등장한 단어는 제거
ngram_range=(1,2): 유니그램 + 바이그램까지 반영
'''
tfidf = TfidfVectorizer(min_df=3, ngram_range=(1,2))
tfidf_matrix = tfidf.fit_transform(df["features_nouns"])

# 코사인 유사도 계산
cos_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
cos_sim_kobert = cosine_similarity(embedding_matrix, embedding_matrix)

# title → index 매핑
title_to_index = pd.Series(df.index, index=df["title"])

# 추천 함수 정의
# TF-IDF+ KoBERT 둘 다 사용
'''
1. TF-IDF 유사도 계산
2. Boosting (subgenre 겹침 가중치 추가)
3. KoBERT 유사도 계산
4. 두 유사도를 가중 평균 → final score
5. 추천 결과 + 이유 추출
'''
def hybrid_recommend_with_reason(title, top_n=5, alpha=0.7, genre_weight=0.1):
    idx = title_to_index[title]

    # 기준 정보
    base_subgenres = set(df.iloc[idx]["subgenre"].split(', ')) if df.iloc[idx]["subgenre"] != "정보 없음" else set()
    base_cast = set(df.iloc[idx]["cast"].split(', ')) if df.iloc[idx]["cast"] != "정보 없음" else set()
    base_desc = set(df.iloc[idx]["features_nouns"].split())

    boosted_tfidf = []
    reasons = []

    for i in range(len(df)):
        if i == idx:
            continue
        # 기본 TF-IDF 유사도
        tfidf_score = cos_sim[idx][i]
        kobert_score = cos_sim_kobert[idx][i]

        # Boosting 근거
        target_subgenres = set(df.iloc[i]["subgenre"].split(', ')) if df.iloc[i]["subgenre"] != "정보 없음" else set()
        target_cast = set(df.iloc[i]["cast"].split(', ')) if df.iloc[i]["cast"] != "정보 없음" else set()
        target_desc = set(df.iloc[i]["features_nouns"].split())

        genre_overlap = base_subgenres & target_subgenres
        cast_overlap = base_cast & target_cast
        desc_overlap = base_desc & target_desc

        # TF-IDF 보정 점수
        tfidf_boosted = tfidf_score + genre_weight * len(genre_overlap)

        # 하이브리드 최종 점수
        final_score = alpha * tfidf_boosted + (1 - alpha) * kobert_score
        boosted_tfidf.append((i, final_score))
        reasons.append((genre_overlap, cast_overlap, desc_overlap))

    # 정렬 및 결과 구성
    top_items = sorted(zip(boosted_tfidf, reasons), key=lambda x: x[0][1], reverse=True)[:top_n]

    results = []
    for ((i, score), (genres, casts, descs)) in top_items:
        result = {
            "title": df.iloc[i]["title"],
            "subgenre": df.iloc[i]["subgenre"],
            "thumbnail": df.iloc[i]["thumbnail"],
            "추천 근거": ""
        }
        if genres:
            result["추천 근거"] += f"장르 겹침: {list(genres)} "
        if casts:
            result["추천 근거"] += f"출연진 겹침: {list(casts)} "
        if descs:
            result["추천 근거"] += f"설명 키워드 겹침: {list(descs)[:3]}"
        results.append(result)

    return pd.DataFrame(results)

# TF-IDF 70% + KoBERT 30% → TF-IDF 중심
reslult = hybrid_recommend_with_reason("이혼숙려캠프", top_n=5, alpha=0.7)

def fast_hybrid_recommend(title, top_n=5, alpha=0.7, genre_weight=0.1):
    idx = title_to_index[title]

    # 기준 정보 추출 (벡터화 전용)
    base_subgenres = set(df.at[idx, "subgenre"].split(', ')) if df.at[idx, "subgenre"] != "정보 없음" else set()
    base_cast = set(df.at[idx, "cast"].split(', ')) if df.at[idx, "cast"] != "정보 없음" else set()
    base_desc = set(df.at[idx, "features_nouns"].split())

    # TF-IDF + KoBERT 점수 배열
    tfidf_scores = cos_sim[idx]
    kobert_scores = cos_sim_kobert[idx]

    final_scores = []
    reasons = []

    for i in range(len(df)):
        if i == idx:
            continue

        genre_overlap = set()
        cast_overlap = set()
        desc_overlap = set()

        if df.at[i, "subgenre"] != "정보 없음":
            genre_overlap = base_subgenres & set(df.at[i, "subgenre"].split(', '))
        if df.at[i, "cast"] != "정보 없음":
            cast_overlap = base_cast & set(df.at[i, "cast"].split(', '))

        desc_overlap = base_desc & set(df.at[i, "features_nouns"].split())

        # Boosted score
        tfidf_boosted = tfidf_scores[i] + genre_weight * len(genre_overlap)
        final_score = alpha * tfidf_boosted + (1 - alpha) * kobert_scores[i]

        final_scores.append((i, final_score))
        reasons.append((genre_overlap, cast_overlap, desc_overlap))

    # 상위 top_n 정렬
    top_items = sorted(zip(final_scores, reasons), key=lambda x: x[0][1], reverse=True)[:top_n]

    results = []
    for ((i, score), (genres, casts, descs)) in top_items:
        result = {
            "title": df.at[i, "title"],
            "subgenre": df.at[i, "subgenre"],
            "thumbnail": df.at[i, "thumbnail"],
            "추천 근거": ""
        }
        if genres:
            result["추천 근거"] += f"장르 겹침: {list(genres)} "
        if casts:
            result["추천 근거"] += f"출연진 겹침: {list(casts)} "
        if descs:
            result["추천 근거"] += f"설명 키워드 겹침: {list(descs)[:3]}"

        result["추천 근거"] = result["추천 근거"].strip()
        results.append(result)

    return pd.DataFrame(results)

def multi_title_fast_hybrid_recommend(titles, top_n=5, alpha=0.7, genre_weight=0.1):
    base_indices = [title_to_index[title] for title in titles if title in title_to_index]
    if not base_indices:
        return pd.DataFrame([])

    # 기준 콘텐츠 집합 구성
    base_subgenres, base_casts, base_descs = set(), set(), set()

    for idx in base_indices:
        if df.at[idx, "subgenre"] != "정보 없음":
            base_subgenres |= set(df.at[idx, "subgenre"].split(', '))
        if df.at[idx, "cast"] != "정보 없음":
            base_casts |= set(df.at[idx, "cast"].split(', '))
        base_descs |= set(df.at[idx, "features_nouns"].split())

    # 평균 유사도 계산
    tfidf_scores = np.mean([cos_sim[idx] for idx in base_indices], axis=0)
    kobert_scores = np.mean([cos_sim_kobert[idx] for idx in base_indices], axis=0)

    final_scores = []
    reasons = []

    for i in range(len(df)):
        if i in base_indices:
            continue

        genre_overlap = set()
        cast_overlap = set()
        desc_overlap = set()

        if df.at[i, "subgenre"] != "정보 없음":
            genre_overlap = base_subgenres & set(df.at[i, "subgenre"].split(', '))
        if df.at[i, "cast"] != "정보 없음":
            cast_overlap = base_casts & set(df.at[i, "cast"].split(', '))
        desc_overlap = base_descs & set(df.at[i, "features_nouns"].split())

        tfidf_boosted = tfidf_scores[i] + genre_weight * len(genre_overlap)
        final_score = alpha * tfidf_boosted + (1 - alpha) * kobert_scores[i]

        final_scores.append((i, final_score))
        reasons.append((genre_overlap, cast_overlap, desc_overlap))

    # 상위 top_n 결과 반환
    top_items = sorted(zip(final_scores, reasons), key=lambda x: x[0][1], reverse=True)[:top_n]

    results = []
    for ((i, score), (genres, casts, descs)) in top_items:
        result = {
            "title": df.at[i, "title"],
            "subgenre": df.at[i, "subgenre"],
            "thumbnail": df.at[i, "thumbnail"],
            "추천 근거": ""
        }
        if genres:
            result["추천 근거"] += f"장르 겹침: {list(genres)} "
        if casts:
            result["추천 근거"] += f"출연진 겹침: {list(casts)} "
        if descs:
            result["추천 근거"] += f"설명 키워드 겹침: {list(descs)[:3]}"
        result["추천 근거"] = result["추천 근거"].strip()
        results.append(result)

    return pd.DataFrame(results)

import os
import sys
import pandas as pd
import numpy as np
from tqdm import tqdm
from sklearn.metrics.pairwise import cosine_similarity
import torch
from torchvision import models, transforms
from PIL import Image
import requests
from io import BytesIO
from konlpy.tag import Okt
from transformers import AutoTokenizer, AutoModel

from sqlalchemy import create_engine

def load_contents_from_db():
    # engine = create_engine("mysql+pymysql://root:rubi@db:3306/ifitv_db")
    engine = create_engine('mysql+pymysql://root:rubi@localhost:3306/ifitv_db')
    df = pd.read_sql("SELECT * FROM vod_contents", engine)
    df = df[df['thumbnail'].notna() & (df['thumbnail'].str.strip() != '')].reset_index(drop=True)
    return df

# ====================== 1. 데이터 로딩 및 전처리 ======================
def load_and_clean_metadata(filepath):
    df = pd.read_csv(filepath)
    df = df[df['thumbnail'].notna() & (df['thumbnail'].str.strip() != '')].reset_index(drop=True)
    return df

def load_embeddings(npy_path, df):
    all_embeds = np.load(npy_path)
    assert all_embeds.shape[0] == df.shape[0], "임베딩 배열과 DataFrame 길이 불일치!"
    return all_embeds

def extract_nouns(text):
    okt = Okt()
    return ' '.join(okt.nouns(str(text)))

def get_bert_embedding(text, tokenizer, model):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()

def build_bert_matrix(desc_list, tokenizer, model):
    embs = []
    for desc in tqdm(desc_list, desc="줄거리 KoBERT 임베딩 추출"):
        try:
            emb = get_bert_embedding(desc, tokenizer, model)
        except Exception:
            emb = np.zeros(768)
        embs.append(emb)
    return np.stack(embs)

# 🔽 1. KoBERT 임베딩 자동 생성
def load_or_build_bert_matrix(df, tokenizer, model, save_path='image_kobert_embedding_matrix.npy'):
    if os.path.exists(save_path):
        print(f"✔️ KoBERT 임베딩 로드 중... ({save_path})")
        matrix = np.load(save_path)
    else:
        print("📌 KoBERT 임베딩 생성 중...")
        desc_list = df['description'].fillna("").tolist()
        matrix = build_bert_matrix(desc_list, tokenizer, model)
        np.save(save_path, matrix)
        print(f"💾 저장 완료: {save_path}")
    if matrix.shape[0] != df.shape[0]:
        raise ValueError(f"❌ KoBERT 임베딩 개수 불일치! {matrix.shape[0]} vs {df.shape[0]}")
    return matrix

# 썸네일 임베딩 자동 생성
def load_or_build_image_embeddings(df, save_path='all_embeds.npy'):
    if os.path.exists(save_path):
        print(f"✔️ 이미지 임베딩 로드 중... ({save_path})")
        embeds = np.load(save_path)
    else:
        print("📌 이미지 임베딩 생성 중...")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = models.resnet50(weights='IMAGENET1K_V1')
        model.fc = torch.nn.Identity()
        model = model.to(device)
        model.eval()

        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])

        embeds = []
        for url in tqdm(df["thumbnail"], desc="썸네일 임베딩 중"):
            emb = get_image_embedding(url, model, device, transform)
            embeds.append(emb)

        embeds = np.stack(embeds)
        np.save(save_path, embeds)
        print(f"💾 저장 완료: {save_path}")
    if embeds.shape[0] != df.shape[0]:
        raise ValueError(f"❌ 썸네일 임베딩 개수 불일치! {embeds.shape[0]} vs {df.shape[0]}")
    return embeds


# ====================== 2. 임베딩 추출 함수 ======================
def get_image_embedding(url, model, device, transform):
    try:
        response = requests.get(url, timeout=5)
        img = Image.open(BytesIO(response.content)).convert('RGB')
        img_t = transform(img).unsqueeze(0).to(device)
        with torch.no_grad():
            embedding = model(img_t)
            embedding = embedding.cpu().numpy().flatten()
            embedding = embedding / np.linalg.norm(embedding)
        return embedding
    except Exception as e:
        print(f"이미지 처리 실패: {url} ({e})")
        return np.zeros(2048)

# ====================== 3. 추천 함수 (KoBERT+서브장르 포함) ======================
def recommend_topn(
    df, all_embeds, input_title, bert_matrix, tokenizer, model,
    weights=(0.3, 0.2, 0.2, 0.3), top_n=10
):
    try:
        row = df[df['title'] == input_title].iloc[0]
    except IndexError:
        raise ValueError(f"[추천 실패] 입력 title '{input_title}'이 데이터프레임에 없습니다.")
    your_thumb = row['thumbnail']
    your_genre = row['genre']
    your_subgenres = set([s.strip() for s in str(row['subgenre']).split(',')])
    your_desc = str(row['description']) if pd.notna(row['description']) else ""

    # 모델 및 전처리 세팅
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    vision_model = models.resnet50(weights='IMAGENET1K_V1')
    vision_model.fc = torch.nn.Identity()
    vision_model = vision_model.to(device)
    vision_model.eval()
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 입력 썸네일 임베딩
    your_embed = get_image_embedding(your_thumb, vision_model, device, transform)
    thumb_sims = cosine_similarity([your_embed], all_embeds)[0]
    df = df.copy()
    df['thumb_sim'] = thumb_sims

    # 장르/서브장르 유사도
    def genre_score(x):
        return 1.0 if str(x).strip() == str(your_genre).strip() else 0.0
    def subgenre_score(x):
        if pd.isna(x):
            return 0.0
        row_set = set([s.strip() for s in str(x).split(',')])
        return 1.0 if row_set & your_subgenres else 0.0
    df['genre_sim'] = df['genre'].apply(genre_score)
    df['subgenre_sim'] = df['subgenre'].apply(subgenre_score)

    # KoBERT 임베딩 기반 줄거리 유사도
    your_bert = get_bert_embedding(your_desc, tokenizer, model)
    bert_sim = cosine_similarity([your_bert], bert_matrix)[0]
    df['summary_bert_sim'] = bert_sim

    # 최종 가중치 유사도 (썸네일 0.3, 장르 0.2, 서브장르 0.2, KoBERT 0.3)
    w_thumb, w_genre, w_subg, w_bert = weights
    df['final_score'] = (
        w_thumb * df['thumb_sim'] +
        w_genre * df['genre_sim'] +
        w_subg  * df['subgenre_sim'] +
        w_bert  * df['summary_bert_sim']
    )

    # 자기 자신 제외 & Top-N 추천 추출
    filtered_df = df[df['title'] != input_title]
    topn = filtered_df.sort_values("final_score", ascending=False).head(top_n)
    return topn

# ====================== 4. 실행 Entry Point ======================
df = load_contents_from_db()
tokenizer = AutoTokenizer.from_pretrained("monologg/kobert", trust_remote_code=True)
model = AutoModel.from_pretrained("monologg/kobert", trust_remote_code=True)
all_embeds = load_or_build_image_embeddings(df)
bert_matrix = load_or_build_bert_matrix(df, tokenizer, model)

if __name__ == "__main__":
    EMBED_NPY = 'all_embeds.npy'
    BERT_MATRIX_NPY = 'image_kobert_embedding_matrix.npy'
    KOBERT_MODEL = "monologg/kobert"

    input_title = input("추천받고 싶은 작품명을 입력하세요: ")
    top_n = 10

    # 1. DB에서 콘텐츠 로드
    meta_df = load_contents_from_db()
    print(meta_df.shape)

    # 2. KoBERT 모델 준비
    tokenizer = AutoTokenizer.from_pretrained(KOBERT_MODEL, trust_remote_code=True)
    model = AutoModel.from_pretrained(KOBERT_MODEL, trust_remote_code=True)

    # 3. 임베딩 로드 또는 생성
    all_embeds = load_or_build_image_embeddings(meta_df, save_path=EMBED_NPY)
    bert_matrix = load_or_build_bert_matrix(meta_df, tokenizer, model, save_path=BERT_MATRIX_NPY)

    # 4. 추천 실행
    result = recommend_topn(
        meta_df,
        all_embeds,
        input_title=input_title,
        bert_matrix=bert_matrix,
        tokenizer=tokenizer,
        model=model,
        weights=(0.3, 0.2, 0.2, 0.3),
        top_n=top_n
    )

    pd.set_option('display.max_columns', None)
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_colwidth', None)
    pd.set_option('display.width', 2000)
    print(result[[
        'title', 'final_score', 'thumb_sim', 'genre_sim', 'subgenre_sim',
        'summary_bert_sim', 'genre', 'subgenre', 'thumbnail'
    ]])
    print('완료!')

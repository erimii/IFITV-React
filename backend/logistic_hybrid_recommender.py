#!/usr/bin/env python3
# hybrid_recommender.py
import os
import pandas as pd
import numpy as np
import scipy.sparse
import argparse
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import warnings
from konlpy.tag import Okt
from transformers import AutoTokenizer, AutoModel
import torch
from sqlalchemy import create_engine
from tqdm import tqdm

warnings.filterwarnings('ignore')

def load_user_logs_from_db():
    # engine = create_engine("mysql+pymysql://root:rubi@db:3306/ifitv_db")
    engine = create_engine('mysql+pymysql://root:rubi@localhost:3306/ifitv_db')
    query = """
    SELECT 
        vwh.profile_id AS profile_id,
        vc.title,
        vwh.watched_percent AS view_percentage,
        CASE WHEN plvc.content_id IS NOT NULL THEN 1 ELSE 0 END AS mylist,
        vwh.watched_at AS watched_time
    FROM vod_watch_history vwh
    JOIN vod_contents vc ON vwh.VOD_content_id = vc.id
    LEFT JOIN profile_liked_vod_contents plvc 
        ON vwh.profile_id = plvc.profile_id AND vc.id = plvc.content_id
    """
    logs = pd.read_sql(query, engine)
    logs['watched_time'] = pd.to_datetime(logs['watched_time'])
    logs['label'] = logs['mylist'].astype(int)
    return logs

def load_vod_contents_from_db():
    # engine = create_engine("mysql+pymysql://root:rubi@db:3306/ifitv_db")
    engine = create_engine('mysql+pymysql://root:rubi@localhost:3306/ifitv_db')
    return pd.read_sql("SELECT * FROM vod_contents", engine)

def build_tfidf_matrix(descriptions):
    vectorizer = TfidfVectorizer(max_features=5000)
    return vectorizer.fit_transform(descriptions)

def build_kobert_embedding_matrix(descriptions, tokenizer, model):
    def get_embedding(text):
        inputs = tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
    
    return np.vstack([
        get_embedding(desc) if isinstance(desc, str) and desc.strip() else np.zeros(768)
        for desc in tqdm(descriptions, desc="KoBERT 임베딩 중")
    ])

class HybridRecommender:
    def __init__(
        self,
        vod_path='data/VOD_장르_연령별_시청률_TOP5.csv',
        live_path='data/실시간_장르_연령별_시청률_TOP5.csv',
        tfidf_path='data/tving_tfidf.npz',
        kobert_path='data/tving_kobert.npy'
    ):
        logs = load_user_logs_from_db()
        df_vod  = pd.read_csv(vod_path)
        df_live = pd.read_csv(live_path)
        meta_df = load_vod_contents_from_db()
        descriptions = meta_df['description'].fillna('').tolist()

        if os.path.exists(tfidf_path):
            self.tfidf_matrix = scipy.sparse.load_npz(tfidf_path)
        else:
            print("TF-IDF 임베딩 생성 중...")
            self.tfidf_matrix = build_tfidf_matrix(descriptions)
            scipy.sparse.save_npz(tfidf_path, self.tfidf_matrix)
            print(f"저장 완료: {tfidf_path}")

        if os.path.exists(kobert_path):
            self.kobert_emb = np.load(kobert_path)
        else:
            print("KoBERT 임베딩 생성 중...")
            tokenizer = AutoTokenizer.from_pretrained("monologg/kobert", trust_remote_code=True)
            model = AutoModel.from_pretrained("monologg/kobert", trust_remote_code=True)
            self.kobert_emb = build_kobert_embedding_matrix(descriptions, tokenizer, model)
            np.save(kobert_path, self.kobert_emb)
            print(f"저장 완료: {kobert_path}")

        self.meta_df = meta_df
        self.title_to_idx    = {t:i for i,t in enumerate(meta_df['title'])}
        self.title_to_genre  = dict(zip(meta_df['title'], meta_df['genre']))
        self.title_to_subs   = {t:set(s.split(',')) for t,s in zip(meta_df['title'], meta_df['subgenre'])}

        if 'cast' not in meta_df.columns:
            meta_df['cast'] = ''
        else:
            meta_df['cast'] = meta_df['cast'].fillna('')

        if 'director' not in meta_df.columns:
            meta_df['director'] = ''
        else:
            meta_df['director'] = meta_df['director'].fillna('')

        self.title_to_cast     = dict(zip(meta_df['title'], meta_df['cast'].str.split(',')))
        self.title_to_director = dict(zip(meta_df['title'], meta_df['director']))
        self.all_titles = pd.concat([df_vod['title'], df_live['title']]).drop_duplicates().tolist()

        rows = []
        for profile_id in logs['profile_id'].unique():
            df_u = logs[logs['profile_id'] == profile_id]
            watched = df_u['title'].tolist()
            pos = df_u[df_u['label'] == 1]['title'].unique().tolist()
            neg_candidates = [t for t in self.all_titles if t not in watched]
            negs = list(np.random.choice(neg_candidates, size=min(len(neg_candidates), max(1, len(pos) * 4)), replace=False))

            for title, label in [(t, 1) for t in pos] + [(t, 0) for t in negs]:
                wc = watched.count(title)
                v = df_vod[df_vod['title']==title].iloc[:,-1].mean() if title in df_vod['title'].values else 0.0
                l = df_live[df_live['title']==title].iloc[:,-1].mean() if title in df_live['title'].values else 0.0
                pop = (v + l) / 2.0

                if title in self.title_to_idx:
                    idx  = self.title_to_idx[title]
                    idxs = [self.title_to_idx[t] for t in watched if t in self.title_to_idx and t!=title]
                    if idxs:
                        tf = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix[idxs]).flatten()
                        kb = cosine_similarity([self.kobert_emb[idx]], self.kobert_emb[idxs]).flatten()
                        cs = float(np.mean(np.concatenate([tf, kb])))
                    else:
                        cs = 0.0
                else:
                    cs = 0.0

                g_sim = 1.0 if self.title_to_genre.get(title) in {self.title_to_genre.get(t) for t in watched} else 0.0
                subs = self.title_to_subs.get(title, set())
                user_subs = set().union(*(self.title_to_subs.get(t, set()) for t in watched))
                sub_sim = len(subs & user_subs) / len(subs | user_subs) if subs and user_subs else 0.0
                vp = df_u[df_u['title'] == title]['view_percentage'].max() if title in df_u['title'].values else 0.0
                cast_ov = len(set().union(*(self.title_to_cast.get(t,[]) for t in watched)) & set(self.title_to_cast.get(title,[])))
                dir_match = 1.0 if self.title_to_director.get(title) in {self.title_to_director.get(t) for t in watched} else 0.0

                rows.append({
                    'profile_id': profile_id,
                    'title': title,
                    'watch_count': wc,
                    'popularity': pop,
                    'content_sim': cs,
                    'genre_sim': g_sim,
                    'subgenre_sim': sub_sim,
                    'view_percentage': vp,
                    'cast_overlap': cast_ov,
                    'director_match': dir_match,
                    'label': label
                })

        self.df_feat = pd.DataFrame(rows).fillna(0.0)
        self.feature_cols = ['watch_count','popularity','content_sim','genre_sim','subgenre_sim','view_percentage','cast_overlap','director_match']
        X = self.df_feat[self.feature_cols].values
        y = self.df_feat['label'].values
        self.pipe = Pipeline([
            ('scaler', StandardScaler()),
            ('clf',    LogisticRegression(max_iter=200))
        ])
        self.pipe.fit(X, y)

    def recommend_top_n(self, profile_id=None, top_n=10):
        if profile_id:
            mask = self.df_feat['profile_id'].astype(str) == str(profile_id)
            if not mask.any():
                return []
            probs = self.pipe.predict_proba(self.df_feat.loc[mask, self.feature_cols].values)[:,1]
            idxs = np.argsort(probs)[::-1][:top_n]
            return self.df_feat.loc[mask, 'title'].iloc[idxs].tolist()
        
        recs = {}
        for profile in self.df_feat['profile_id'].unique():
            mask = self.df_feat['profile_id'] == profile
            probs = self.pipe.predict_proba(self.df_feat.loc[mask, self.feature_cols].values)[:,1]
            idxs = np.argsort(probs)[::-1][:top_n]
            recs[profile] = self.df_feat.loc[mask, 'title'].iloc[idxs].tolist()
        return recs

    def recommend_df(self, profile_id, top_n=10):
        titles = self.recommend_top_n(profile_id=profile_id, top_n=top_n)
        if not titles:
            return pd.DataFrame(columns=['title','subgenre','thumbnail','description'])
        df = self.meta_df
        return df[df['title'].isin(titles)][['title','subgenre','thumbnail','description']].reset_index(drop=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--profile', type=str, help='추천할 profile_id')
    parser.add_argument('--top_n', type=int, default=10, help='추천 개수')
    args = parser.parse_args()

    hr = HybridRecommender()
    if args.profile:
        print(f"=== Top-{args.top_n} for Profile {args.profile} ===")
        titles = hr.recommend_top_n(profile_id=args.profile, top_n=args.top_n)
        print(titles)
    else:
        print(f"=== Top-{args.top_n} for All Profiles ===")
        recs_all = hr.recommend_top_n(top_n=args.top_n)
        for p, titles in recs_all.items():
            print(f"Profile {p}: {titles}")

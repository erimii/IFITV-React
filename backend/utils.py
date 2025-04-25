import pandas as pd
import os

def load_today_programs():
    csv_list = pd.concat([
        pd.read_csv(f"./data_crawling_live/{file}")
        for file in os.listdir("./data_crawling_live") if file.endswith(".csv")
    ], ignore_index=True)
    return csv_list

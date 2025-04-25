import pandas as pd
import os
from datetime import datetime

def load_today_programs():
    csv_list = pd.concat([
        pd.read_csv(f"./data_crawling_live/{file}")
        for file in os.listdir("./data_crawling_live") if file.endswith(".csv")
    ], ignore_index=True)
    return csv_list


def is_future_program(time_str):
    """방송 시간이 현재 시간 이후인지 확인"""
    try:
        time_format = "%H:%M:%S" if len(time_str.strip().split(":")) == 3 else "%H:%M"
        now = datetime.now().time()
        program_time = datetime.strptime(time_str.strip(), time_format).time()
        return program_time >= now
    except:
        return True  # 파싱 실패 시 우선 포함시킴

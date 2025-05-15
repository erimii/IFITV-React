import pandas as pd
import os
from datetime import datetime
from django.conf import settings

def load_today_programs():
    data_dir = os.path.join(settings.BASE_DIR, 'data_crawling_live')
    csv_list = pd.concat([
        pd.read_csv(os.path.join(data_dir, file))
        for file in os.listdir(data_dir) if file.endswith(".csv")
    ], ignore_index=True)
    return csv_list

from datetime import datetime, timedelta

def is_current_or_future_program(airtime_str, runtime_minutes):
    """현재 시간 기준, 방송 중이거나 예정인 프로그램인지 확인"""
    try:
        # airtime 파싱 (datetime or time string 지원)
        time_format = "%H:%M:%S" if len(airtime_str.strip().split(":")) == 3 else "%H:%M"
        now = datetime.now()
        program_time = datetime.strptime(airtime_str.strip(), time_format).replace(
            year=now.year, month=now.month, day=now.day
        )
        program_end_time = program_time + timedelta(minutes=int(runtime_minutes))

        return program_end_time >= now  # 현재시간이 끝나기 전이면 포함
    except:
        return True  # 파싱 실패 시 포함


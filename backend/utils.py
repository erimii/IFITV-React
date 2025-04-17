import os
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import re
import requests


def get_naver_program_info(program_name, client_id, client_secret):
    url = "https://openapi.naver.com/v1/search/webkr.json"
    headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret
    }
    params = {
        "query": program_name,
        "display": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            items = response.json().get("items", [])
            if items:
                item = items[0]
                description = item.get("description", "").strip()
                link = item.get("link", "").strip()

                cast_match = re.search(r'(출연\s*[:：]?\s*)([^\n,\.]{2,}(,\s*[^\n,\.]{2,})*)', description)
                cast = cast_match.group(2).strip() if cast_match else ''

                return description, cast, link
        return '', '', ''
    except Exception as e:
        print(f"[에러] '{program_name}' 검색 중 오류: {e}")
        return '', '', ''


def save_today_programs_to_csv():
    client_id = "TDvpMF9QZCWXUcBAcDoB"
    client_secret = "7gmBchtAm_"
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)

    channel_list = ["KBS1[9]", "KBS2[7]", "MBC[11]", "SBS[5]", "tvN[3]", "JTBC[15]"]
    url = 'https://www.lguplus.com/iptv/channel-guide'
    driver.get(url)
    driver.execute_script("document.body.style.zoom='50%'")
    time.sleep(1)

    wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(text(), "채널 편성표 안내")]'))).click()
    time.sleep(1)
    wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(text(), "전체채널")]'))).click()

    os.makedirs("data_crawling_live", exist_ok=True)

    for channel in channel_list:
        try:
            wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a.c-btn-outline-2-s.open"))).click()
            channel_btn_xpath = f'//a[contains(text(), "{channel}")]'
            wait.until(EC.element_to_be_clickable((By.XPATH, channel_btn_xpath))).click()
            time.sleep(1)

            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            program_soup_list = soup.select('tr.point')

            program_list = []
            for item in program_soup_list:
                try:
                    tds = item.select('td')
                    time_text = tds[0].text.strip()
                    name_parts = tds[1].text.split('\n')
                    raw_name = name_parts[1].strip() if len(name_parts) > 1 else tds[1].text.strip()
                    name = re.sub(r'\s*(\[[^]]*\]|\([^)]*\))', '', raw_name).strip()
                    genre = tds[2].text.strip()
                    desc, cast, link = get_naver_program_info(name, client_id, client_secret)
                    safe_channel_name = re.sub(r'\s*(\[[^]]*\]|\([^)]*\)|<[^>]*>)', '', channel).strip()
                    program_list.append([safe_channel_name, time_text, name, genre, cast, desc])
                    time.sleep(0.1)
                except Exception as e:
                    print(f"[프로그램 처리 오류] {e}")
                    continue

            columns = ['채널명', '방송 시간', '프로그램명', '장르', '출연진', '설명']
            program_df = pd.DataFrame(program_list, columns=columns)
            csv_file = f'./data_crawling_live/{safe_channel_name}_program_list.csv'
            program_df.to_csv(csv_file, index=False, encoding='utf-8-sig')
            time.sleep(1)
        except Exception as e:
            print(f"[채널 처리 오류] {e}")
            continue

    driver.quit()
    print("✅ 오늘 편성표 크롤링 및 저장 완료!")


def load_today_programs():
    csv_list = pd.concat([
        pd.read_csv(f"./data_crawling_live/{file}")
        for file in os.listdir("./data_crawling_live") if file.endswith(".csv")
    ], ignore_index=True)
    return csv_list

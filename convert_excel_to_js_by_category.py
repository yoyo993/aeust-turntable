import pandas as pd
from datetime import datetime
import json
import numpy as np

file_name = r"C:\Users\yo090\Downloads\亞東科技大學美食地圖\亞東科技大學美食地圖\data.xlsx"
df = pd.read_excel(file_name)

# 清理欄位名稱空白
df.columns = df.columns.str.strip()

print("👉 欄位名稱:", df.columns.tolist())
print("👉 總資料筆數:", len(df))

# 把類別中空值填成 "未分類"
df["類別"] = df["類別"].fillna("未分類")

# 轉換避免 JSON 報錯
def convert(o):
    if isinstance(o, (np.integer, np.int64, np.int32)):
        return int(o)
    elif isinstance(o, (np.floating, np.float64, np.float32)):
        return float(o)
    elif pd.isna(o):
        return ""
    else:
        return str(o).strip()

# 新增解析營業時間函式，展開範圍（如 一至四、二-五）
def parse_open_hours(open_hours_str):
    if pd.isna(open_hours_str) or not open_hours_str.strip():
        return {}

    day_map = {"一":1, "二":2, "三":3, "四":4, "五":5, "六":6, "日":7}

    def expand_days(day_range):
        days = []
        if "至" in day_range:
            start, end = day_range.split("至")
        elif "-" in day_range:
            start, end = day_range.split("-")
        else:
            return [day_range.strip()]
        start_idx = day_map[start.strip()]
        end_idx = day_map[end.strip()]
        for i in range(start_idx, end_idx + 1):
            for k,v in day_map.items():
                if v == i:
                    days.append(k)
        return days

    d = {}
    parts = open_hours_str.split(',')
    for p in parts:
        if ':' in p:
            day_part, hours = p.split(':', 1)
            days = expand_days(day_part.strip())
            for day in days:
                d[day] = hours.strip()
    return d

groups = df.groupby("類別")

current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
output = {}

for category, group in groups:
    arr = []
    for _, row in group.iterrows():
        row = row.to_dict()

        # 處理電話
        phone = convert(row.get("電話", ""))
        if phone and phone.isdigit() and not phone.startswith("0"):
            phone = "0" + phone

        # 解析營業時間欄位
        raw_hours = convert(row.get("營業時間", ""))
        hours_dict = parse_open_hours(raw_hours)

        item = {
            "name": convert(row.get("名稱", "")),
            "address": convert(row.get("地址", "")),
            "mapUrl": convert(row.get("地圖", "")),
            "rating": convert(row.get("評價", "")),
            "phone": phone,
            "openHours": hours_dict  # 新增營業時間結構
        }
        arr.append(item)
    output[category] = arr

output["lastUpdated"] = current_time

# 寫到 data.js
with open("data.js", "w", encoding="utf-8") as f:
    f.write("const data = ")
    json.dump(output, f, ensure_ascii=False, indent=2)
    f.write(";")

print("\n✅ 已匯出到 data.js，電話已補0，並包含更新時間和解析後的營業時間。")

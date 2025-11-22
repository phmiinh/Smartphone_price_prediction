import pandas as pd
import numpy as np
import pickle
import re

# 1. Load dữ liệu gốc
# Lưu ý: Đảm bảo file rootdata.csv nằm cùng thư mục với file code này
try:
    df = pd.read_csv('rootdata.csv', encoding='latin1')
    print(f"Đã load dữ liệu: {df.shape}")
except FileNotFoundError:
    print("❌ Lỗi: Không tìm thấy file 'rootdata.csv'. Hãy kiểm tra lại tên file.")
    exit()

# 2. Hàm làm sạch giá tiền (Target)
def clean_usa_price(price_str):
    if pd.isna(price_str):
        return np.nan
    # Xóa ký tự tiền tệ và dấu phẩy
    price_str = str(price_str).replace("USD", "").replace("$", "").replace(",", "").strip()
    try:
        value = float(price_str)
        # Lọc nhiễu: Giá quá thấp (<99) hoặc quá cao (>2000) coi như lỗi (theo logic cũ)
        if 99 <= value <= 2000:
            return value
        else:
            return np.nan
    except:
        return np.nan

# 3. Áp dụng làm sạch và tính toán
print("Đang xử lý dữ liệu...")

# Làm sạch giá tiền
df["Launched Price (USA)"] = df["Launched Price (USA)"].apply(clean_usa_price)

# Bỏ các dòng không có giá tiền (vì không tính được trung bình)
df_clean = df.dropna(subset=["Launched Price (USA)"])

if df_clean.empty:
    print("❌ Lỗi: Không còn dữ liệu sau khi làm sạch giá tiền.")
    exit()

# Tính giá trung bình cho từng loại Chip (Processor)
processor_stats = df_clean.groupby('Processor')['Launched Price (USA)'].mean().reset_index()

# Scale giá trị (Chia cho 100 theo logic của hệ thống)
processor_stats['Processor_Avg_Price_Scaled'] = processor_stats['Launched Price (USA)'] / 100

# 4. Tạo dictionary và lưu file
processor_map_dict = dict(zip(processor_stats['Processor'], processor_stats['Processor_Avg_Price_Scaled']))

OUTPUT_FILE = 'processor_map.pkl'
try:
    with open(OUTPUT_FILE, 'wb') as f:
        pickle.dump(processor_map_dict, f)
    
    print("\n" + "="*40)
    print(f"✅ THÀNH CÔNG! Đã tạo file: {OUTPUT_FILE}")
    print(f"Số lượng chip đã học: {len(processor_map_dict)}")
    print("="*40)
    
    # In thử vài mẫu để kiểm tra
    print("\nMột vài ví dụ mẫu trong file map:")
    sample_keys = list(processor_map_dict.keys())[:5]
    for key in sample_keys:
        print(f"  - {key}: {processor_map_dict[key]:.2f}")
        
except Exception as e:
    print(f"\n❌ Lỗi khi lưu file: {e}")
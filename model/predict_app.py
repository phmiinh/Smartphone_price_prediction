import pandas as pd
import numpy as np
import re
import pickle

# --- 1. CLASS XỬ LÝ DỮ LIỆU (MỚI) ---
class NewMobilePreprocessor:
    def __init__(self):
        self.processor_map = {}
        # Thứ tự cột phải Y HỆT lúc train (trong file dataAfterPreprocess.csv)
        self.feature_columns = [
            'RAM', 'Front Camera', 'Back Camera', 'Battery Capacity', 'Screen Size', 'ROM',
            'Company_Apple', 'Company_Honor', 'Company_Oppo', 'Company_Other', 'Company_Samsung', 'Company_Vivo',
            'Processor_Avg_Price_Scaled'
        ]
        self.top_companies = ['Apple', 'Samsung', 'Vivo', 'Honor', 'Oppo']

    def load_resources(self):
        try:
            # Load bảng giá chip
            with open('processor_map.pkl', 'rb') as f:
                self.processor_map = pickle.load(f)
            print("✓ Đã load Processor Map")
            return True
        except FileNotFoundError:
            print("❌ Lỗi: Không tìm thấy file 'processor_map.pkl'. Hãy chạy file create_map.py trước.")
            return False

    def clean_numeric(self, val):
        if pd.isna(val): return 0
        val = str(val).upper()
        # Lọc lấy số (ví dụ: "12GB" -> 12.0)
        val = re.sub(r'[A-Z\s+]', '', val) 
        try:
            match = re.search(r'(\d+\.?\d*)', val)
            return float(match.group(1)) if match else 0
        except:
            return 0

    def extract_rom(self, model_name, rom_val):
        # Logic lấy ROM: Ưu tiên từ tên Model, nếu không có thì lấy cột ROM
        model_name = str(model_name).upper()
        match_tb = re.search(r'(\d+\.?\d*)TB', model_name)
        if match_tb: return float(match_tb.group(1))
        
        match_gb = re.search(r'(\d+\.?\d*)GB', model_name)
        if match_gb: return float(match_gb.group(1)) / 1024 # Đổi GB sang TB
        
        # Nếu tên không có, check biến rom_val nhập vào
        if rom_val:
            val = self.clean_numeric(rom_val)
            return val / 1024 if val > 10 else val 
        
        return 0.125 # Mặc định

    def preprocess(self, input_data):
        processed = {col: 0.0 for col in self.feature_columns}
        
        # 1. Số học
        processed['RAM'] = self.clean_numeric(input_data.get('RAM'))
        processed['Front Camera'] = self.clean_numeric(input_data.get('Front Camera'))
        processed['Back Camera'] = self.clean_numeric(input_data.get('Back Camera'))
        
        # Pin: Chia 1000 (4400mAh -> 4.4)
        batt = self.clean_numeric(input_data.get('Battery Capacity'))
        processed['Battery Capacity'] = batt / 1000 if batt > 10 else batt
        
        processed['Screen Size'] = self.clean_numeric(input_data.get('Screen Size'))
        processed['ROM'] = self.extract_rom(input_data.get('Model Name'), input_data.get('ROM'))

        # 2. Company (One-Hot)
        company = input_data.get('Company Name', 'Other')
        if company in self.top_companies:
            col_name = f"Company_{company}"
            processed[col_name] = 1.0
        else:
            processed['Company_Other'] = 1.0

        # 3. Processor (Map giá trị)
        proc_name = input_data.get('Processor', '')
        # Lấy giá trị từ file map, nếu chip lạ chưa học thì lấy 4.37 (trung bình)
        processed['Processor_Avg_Price_Scaled'] = self.processor_map.get(proc_name, 4.37)

        return pd.DataFrame([processed])

# --- 2. HÀM DỰ ĐOÁN ---
def predict_price(phone_info):
    print("\n" + "="*50)
    print(f"📱 ĐANG DỰ ĐOÁN CHO: {phone_info.get('Model Name')}")
    print("="*50)
    
    # Khởi tạo
    preprocessor = NewMobilePreprocessor()
    if not preprocessor.load_resources(): return

    # Xử lý dữ liệu
    X_input = preprocessor.preprocess(phone_info)
    
    # Load Model
    try:
        with open('rf_model_new.pkl', 'rb') as f:
            model = pickle.load(f)
        
        # Dự đoán
        price_pred = model.predict(X_input)[0]
        
        print(f"\n✅ CẤU HÌNH ĐÃ XỬ LÝ:")
        print(X_input.iloc[0].to_string())
        print("-" * 30)
        print(f"💰 GIÁ DỰ ĐOÁN: ${price_pred:.2f}")
        print("="*50)
        
    except FileNotFoundError:
        print("❌ Lỗi: Không tìm thấy file model 'rf_model_new.pkl'. Hãy chạy train trước.")
    except Exception as e:
        print(f"❌ Lỗi dự đoán: {e}")

# --- 3. CHẠY TEST (MAIN) ---
if __name__ == "__main__":
    
    # --- TEST CASE 1: Samsung Galaxy Z Fold 6 ---
    z_fold_6 = {
        'Model Name': 'OPPO Find  X6 pro 128GB', # ROM sẽ tự trích xuất từ đây (512GB -> 0.5TB)
        'Company Name': 'Samsung',
        'RAM': '4GB',
        'Front Camera': '12MP', # Camera trước
        'Back Camera': '8MP',  # Camera sau chính
        'Battery Capacity': '3500mAh',
        'Screen Size': '6.5 inches',
        'Processor': 'A17 Bionic' # Tên chip phải khớp với data huấn luyện để có giá chính xác
    }
    
    predict_price(z_fold_6)

   
"""
FastAPI service để serve Mobile Price Range Prediction model
Chạy: python main.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
import pickle
import json
import os
import sys
import pandas as pd

# Import model từ parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(title="Mobile Price Range Prediction API")

# CORS - Allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODEL SETUP
# ============================================
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "price_predictor.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "processor_vectorizer.pkl")
PCA_PATH = os.path.join(MODEL_DIR, "processor_pca.pkl")

# Load model và scaler khi start service
try:
    print(f"📥 Loading model from: {MODEL_PATH}")
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully")
    
    # Load scaler nếu có
    scaler = None
    if os.path.exists(SCALER_PATH):
        print(f"📥 Loading scaler from: {SCALER_PATH}")
        with open(SCALER_PATH, 'rb') as f:
            scaler = pickle.load(f)
        print("✅ Scaler loaded successfully")
    else:
        print("⚠️ No scaler found, using raw features")
    # Optional: load text vectorizer and PCA for processor field
    vectorizer = None
    pca = None
    if os.path.exists(VECTORIZER_PATH):
        try:
            with open(VECTORIZER_PATH, 'rb') as f:
                vectorizer = pickle.load(f)
            print("✅ Processor vectorizer loaded")
        except Exception as _:
            print("⚠️ Failed to load processor vectorizer, will fallback to zeros")
    if os.path.exists(PCA_PATH):
        try:
            with open(PCA_PATH, 'rb') as f:
                pca = pickle.load(f)
            print("✅ Processor PCA loaded")
        except Exception as _:
            print("⚠️ Failed to load processor PCA, will fallback to zeros")
        
except FileNotFoundError:
    print(f"❌ Error: Model file not found at {MODEL_PATH}")
    print("Please ensure models/price_predictor.pkl exists")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error loading model: {e}")
    sys.exit(1)

# ============================================
# REQUEST/RESPONSE MODELS
# ============================================
class PredictRequest(BaseModel):
    # All input features from CSV (except Launched Price and Launched Year)
    # Required fields
    ram_gb: int = Field(..., description="RAM in GB; options: 4,6,8,12,16")
    rom_option: str = Field(..., description="ROM options: 32,64,128,256,512,1TB,2TB")
    chip: str = Field(..., description="Chip/Processor name (e.g., 'Snapdragon 8 Gen 2', 'A17 Bionic')")
    brand: str = Field(..., description="Brand: Apple, Samsung, Oppo, Honor, Vivo, or Other")
    # Optional fields with defaults (matching CSV format)
    front_camera_mp: Optional[float] = Field(None, description="Front Camera MP; default 12MP if not provided")
    back_camera_mp: Optional[float] = Field(None, description="Back Camera MP; default 12MP if not provided")
    battery_mah: Optional[int] = Field(None, description="Battery Capacity in mAh; default 4000 if not provided")
    screen_size_in: Optional[float] = Field(None, description="Screen Size in inches; default 6.0 if not provided")
    mobile_weight_g: Optional[float] = Field(None, description="Mobile Weight in grams (optional, not used in current model)")

class PredictResponse(BaseModel):
    price_usd: float = Field(..., description="Predicted price in USD (regression output)")
    price_vnd: int = Field(..., description="Predicted price in VND (converted)")
    # Optional: class and proba for backward compatibility
    class_: Optional[int] = Field(None, alias="class", description="Predicted price range (0-3)")
    proba: Optional[List[float]] = Field(None, description="Probabilities for each class [0, 1, 2, 3]")

    class Config:
        allow_population_by_field_name = True

# ============================================
# FEATURE ORDER (Phải khớp với training)
# ============================================
# Training feature order used in your notebook regression X:
# ['RAM','Front Camera','Back Camera','Battery Capacity','Screen Size','ROM',
#  'Company_Apple','Company_Honor','Company_Oppo','Company_Other','Company_Samsung','Company_Vivo',
#  'Processor_vec1','Processor_vec2','Processor_vec3']
REG_FEATURE_ORDER = [
    'RAM', 'Front Camera', 'Back Camera', 'Battery Capacity', 'Screen Size', 'ROM',
    'Company_Apple', 'Company_Honor', 'Company_Oppo', 'Company_Other', 'Company_Samsung', 'Company_Vivo',
    'Processor_vec1', 'Processor_vec2', 'Processor_vec3'
]

DEFAULT_VND_BANDS = [
    [0, 2_000_000, 4_000_000],
    [1, 4_000_000, 8_000_000],
    [2, 8_000_000, 15_000_000],
    [3, 15_000_000, 30_000_000],
]

def rom_option_to_reg_feature(rom_option: str) -> float:
    """
    Convert ROM option to numeric value matching notebook processing.
    Notebook uses: clean_numeric(..., remove_str="GB", round_to_int=True)
    So ROM is just the GB number, not divided by 64.
    """
    opt = rom_option.strip().upper()
    if opt.endswith("TB"):
        try:
            tb_val = float(opt.replace('TB', '').strip())
        except Exception:
            tb_val = 1.0
        # Convert TB to GB
        gb = tb_val * 1024.0
    else:
        # assume GB number as string
        try:
            gb = float(opt.replace('GB', '').strip())
        except Exception:
            gb = 128.0  # Default to 128GB
    # Notebook test case: ROM = clean_numeric("256GB", remove_str="GB") = 256 (not divided)
    return float(gb)

def load_pricing_bands_vnd() -> List[List[float]]:
    raw = os.environ.get('PRICING_BANDS_VND')
    if not raw:
        return DEFAULT_VND_BANDS
    try:
        bands = json.loads(raw)
        # validate shape [ [cls, min, max], ... ]
        valid = []
        for item in bands:
            if isinstance(item, list) and len(item) == 3:
                valid.append([int(item[0]), float(item[1]), float(item[2])])
        return valid if valid else DEFAULT_VND_BANDS
    except Exception:
        return DEFAULT_VND_BANDS

def map_price_to_class_and_proba(price_vnd: float) -> Tuple[int, List[float]]:
    bands = load_pricing_bands_vnd()
    # compute class
    chosen_class = bands[0][0]
    for band in bands:
        _, mn, mx = band
        if mn <= price_vnd <= mx:
            chosen_class = int(band[0])
            break
        if price_vnd > bands[-1][2]:
            chosen_class = int(bands[-1][0])
    # soft probabilities based on distance to band centers
    centers = [ (b[1] + b[2]) / 2.0 for b in bands ]
    dists = [ abs(price_vnd - c) for c in centers ]
    # convert distances to similarities
    # add small epsilon to avoid div by zero
    eps = 1e-6
    sims = [ 1.0 / (d + eps) for d in dists ]
    total = sum(sims)
    if total <= 0:
        proba = [1.0 if i == chosen_class else 0.0 for i in range(4)]
    else:
        proba = [ s / total for s in sims ]
    # ensure length 4
    if len(proba) != 4:
        proba = [1.0 if i == chosen_class else 0.0 for i in range(4)]
    return chosen_class, proba

# ============================================
# API ENDPOINTS
# ============================================
@app.get("/")
def root():
    return {
        "message": "Mobile Price Range Prediction API",
        "status": "running",
        "endpoints": {
            "predict": "/predict (POST)"
        }
    }

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """
    Accepts friendly inputs, reconstructs the 15-feature vector used in training,
    predicts USD price via regression model, converts to VND, maps to class 0-3,
    and returns {class, proba, price_usd, price_vnd}.
    """
    try:
        # ============================================
        # FEATURE EXTRACTION FROM CSV INPUTS
        # ============================================
        # CSV columns (inputs): Company Name, Model Name, Mobile Weight, RAM, Front Camera, 
        #                       Back Camera, Processor, Battery Capacity, Screen Size
        # CSV columns (outputs): Launched Price (USA), Launched Year
        #
        # Model uses 15 features in this exact order:
        # 1. RAM (from CSV: RAM, cleaned from "GB")
        # 2. Front Camera (from CSV: Front Camera, cleaned from "MP")
        # 3. Back Camera (from CSV: Back Camera, cleaned from "MP")
        # 4. Battery Capacity (from CSV: Battery Capacity, cleaned from "mAh", divided by 1000)
        # 5. Screen Size (from CSV: Screen Size, cleaned from "inches")
        # 6. ROM (from CSV: Model Name, extracted via regex, divided by 64)
        # 7-12. Company one-hot (from CSV: Company Name → Company_Apple, Company_Honor, etc.)
        # 13-15. Processor vectors (from CSV: Processor → TF-IDF → PCA to 3 components)
        # Note: Mobile Weight is in CSV but not used in current model's 15 features
        
        # ============================================
        # PROCESS INPUTS EXACTLY AS IN NOTEBOOK TEST CASE
        # ============================================
        # Notebook test case processing:
        # - RAM: clean_numeric("12GB", remove_str="GB", round_to_int=True) = 12
        # - ROM: clean_numeric("256GB", remove_str="GB", round_to_int=True) = 256
        # - Front Camera: clean_numeric("50MP", remove_str="MP") / 10 = 5.0
        # - Back Camera: clean_numeric("50MP", remove_str="MP") / 10 = 5.0
        # - Battery Capacity: clean_numeric("5000mAh", remove_str="mAh", round_to_int=True) / 1000 = 5.0
        # - Screen Size: clean_numeric("6.9 inches", remove_str="inches") = 6.9
        
        # Apply defaults for optional fields
        front_cam_mp = request.front_camera_mp if request.front_camera_mp is not None else 12.0
        back_cam_mp = request.back_camera_mp if request.back_camera_mp is not None else 12.0
        battery_mah = request.battery_mah if request.battery_mah is not None else 4000
        screen_in = request.screen_size_in if request.screen_size_in is not None else 6.0

        # Process exactly as notebook: Front Camera / 10, Back Camera / 10
        front_cam_feature = float(front_cam_mp) / 10.0
        back_cam_feature = float(back_cam_mp) / 10.0
        
        # Process exactly as notebook: Battery Capacity / 1000
        battery_capacity_feature = float(battery_mah) / 1000.0
        
        # Process exactly as notebook: RAM (already in GB, no division)
        ram_feature = float(request.ram_gb)
        
        # Process exactly as notebook: ROM (already in GB, no division by 64)
        rom_feature = rom_option_to_reg_feature(request.rom_option)
        
        # Process exactly as notebook: Screen Size (already in inches)
        screen_size_feature = float(screen_in)

        # Build brand one-hot from brand string (matching notebook logic)
        brand_upper = request.brand.strip().title()  # Normalize: "apple" -> "Apple"
        company = {
            'Company_Apple': 1 if brand_upper == 'Apple' else 0,
            'Company_Honor': 1 if brand_upper == 'Honor' else 0,
            'Company_Oppo': 1 if brand_upper == 'Oppo' else 0,
            'Company_Other': 1 if brand_upper not in ['Apple', 'Samsung', 'Oppo', 'Honor', 'Vivo'] else 0,
            'Company_Samsung': 1 if brand_upper == 'Samsung' else 0,
            'Company_Vivo': 1 if brand_upper == 'Vivo' else 0,
        }

        # Processor vectors (exactly as notebook)
        proc_vec1 = 0.0
        proc_vec2 = 0.0
        proc_vec3 = 0.0
        if 'vectorizer' in globals() and vectorizer is not None and 'pca' in globals() and pca is not None:
            try:
                tfidf = vectorizer.transform([request.chip])
                pca_vals = pca.transform(tfidf.toarray())[0]
                # len 3 expected
                proc_vec1, proc_vec2, proc_vec3 = float(pca_vals[0]), float(pca_vals[1]), float(pca_vals[2])
            except Exception:
                pass

        # Get required feature names from model's preprocessor (matching notebook logic)
        required_cols = None
        if hasattr(model, 'named_steps') and 'preprocessor' in model.named_steps:
            pre = model.named_steps['preprocessor']
            if hasattr(pre, 'named_steps') and 'imputer' in pre.named_steps:
                imputer = pre.named_steps['imputer']
                if hasattr(imputer, 'feature_names_in_'):
                    required_cols = list(imputer.feature_names_in_)
        
        if required_cols is None:
            raise HTTPException(status_code=500, detail="Cannot determine required feature names from model")
        
        # Build DataFrame with required columns in exact order (matching notebook)
        X_in = pd.DataFrame(index=[0])
        
        # Map our inputs to model's expected features (exactly as notebook)
        for col in required_cols:
            if col == 'RAM':
                X_in[col] = ram_feature
            elif col == 'Screen Size':
                X_in[col] = screen_size_feature
            elif col == 'ROM':
                X_in[col] = rom_feature
            elif col == 'Front Camera':
                X_in[col] = front_cam_feature
            elif col == 'Back Camera':
                X_in[col] = back_cam_feature
            elif col == 'Battery Capacity':
                X_in[col] = battery_capacity_feature
            elif col.startswith('Company_'):
                comp_name = col.split('Company_')[-1]
                X_in[col] = company.get(col, 0)
            elif col.startswith('Processor_vec'):
                vec_num = int(col.replace('Processor_vec', ''))
                if vec_num == 1:
                    X_in[col] = proc_vec1
                elif vec_num == 2:
                    X_in[col] = proc_vec2
                elif vec_num == 3:
                    X_in[col] = proc_vec3
                else:
                    X_in[col] = 0.0
            elif col == 'Launched Year':
                # Model expects this but we don't have it - use current year or median
                X_in[col] = 2024  # Default to current year
            else:
                # Unknown column - set to 0
                X_in[col] = 0.0
        
        # Ensure column order matches required_cols exactly
        X_in = X_in.reindex(columns=required_cols, fill_value=0.0)
        
        # Predict USD (regression) - model output is already in USD
        # Notebook shows pred[0] * 100, but that's because target was divided by 100 during training
        # Actually, model output is already in USD, no need to multiply
        try:
            price_usd = float(model.predict(X_in)[0])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model predict failed: {str(e)}")

        # Convert to VND
        usd_to_vnd = float(os.environ.get('USD_TO_VND', '25000'))
        price_vnd = int(max(0, round(price_usd * usd_to_vnd)))

        # Map to class/proba according to VND bands (optional, for backward compatibility)
        cls, proba = map_price_to_class_and_proba(price_vnd)
        
        return PredictResponse(
            price_usd=round(price_usd, 2),
            price_vnd=price_vnd,
            class_=int(cls),
            proba=[float(x) for x in proba],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting API server at http://localhost:8000")
    print("📚 API docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)



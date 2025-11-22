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
import warnings

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
# Try multiple possible model file names
# From modeling_knn_dt_rf_nn (3).ipynb: model is saved as 'rf_model_new.pkl'
MODEL_PATH = None
for model_name in ["rf_model_new.pkl", "price_predictor.pkl", "random_forest_model.pkl", "decision_tree_model.pkl", "knn_model.pkl"]:
    potential_path = os.path.join(MODEL_DIR, model_name)
    if os.path.exists(potential_path):
        MODEL_PATH = potential_path
        break
if MODEL_PATH is None:
    MODEL_PATH = os.path.join(MODEL_DIR, "rf_model_new.pkl")  # Default fallback (from new notebook)
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "processor_vectorizer.pkl")
PCA_PATH = os.path.join(MODEL_DIR, "processor_pca.pkl")
TARGET_ENCODER_PATH = os.path.join(MODEL_DIR, "target_encoder_fitted.pkl")

# Load processor map for Processor_Avg_Price_Scaled
PROCESSOR_MAP_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model", "processor_map.pkl")
processor_map = {}
try:
    if os.path.exists(PROCESSOR_MAP_PATH):
        print(f"📥 Loading processor map from: {PROCESSOR_MAP_PATH}")
        with open(PROCESSOR_MAP_PATH, 'rb') as f:
            processor_map = pickle.load(f)
        print(f"✅ Processor map loaded successfully ({len(processor_map)} processors)")
    else:
        print(f"⚠️ Processor map not found at {PROCESSOR_MAP_PATH}, will use fallback mapping")
except Exception as e:
    print(f"⚠️ Failed to load processor map: {e}, will use fallback mapping")

# Load model và scaler khi start service
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found. Tried: {MODEL_PATH}\nPlease ensure one of these files exists in {MODEL_DIR}:\n  - price_predictor.pkl\n  - random_forest_model.pkl\n  - decision_tree_model.pkl\n  - knn_model.pkl")
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
    # Load Target Encoder (K-Fold Target Encoding for Company and Processor)
    target_encoder = None
    if os.path.exists(TARGET_ENCODER_PATH):
        try:
            with open(TARGET_ENCODER_PATH, 'rb') as f:
                target_encoder = pickle.load(f)
            print("✅ Target encoder loaded successfully")
        except Exception as e:
            print(f"⚠️ Failed to load target encoder: {e}, will use fallback encoding")
    else:
        print("⚠️ No target encoder found, will use fallback encoding")
    
    # Optional: load text vectorizer and PCA for processor field (old method, deprecated)
    vectorizer = None
    pca = None
    if os.path.exists(VECTORIZER_PATH):
        try:
            with open(VECTORIZER_PATH, 'rb') as f:
                vectorizer = pickle.load(f)
            print("✅ Processor vectorizer loaded (deprecated)")
        except Exception as _:
            pass
    if os.path.exists(PCA_PATH):
        try:
            with open(PCA_PATH, 'rb') as f:
                pca = pickle.load(f)
            print("✅ Processor PCA loaded (deprecated)")
        except Exception as _:
            pass
        
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
# Training feature order from modeling_knn_dt_rf_nn (3).ipynb:
# ['RAM', 'Front Camera', 'Back Camera', 'Battery Capacity', 'Screen Size', 'ROM',
#  'Company_Apple', 'Company_Honor', 'Company_Oppo', 'Company_Other', 'Company_Samsung', 'Company_Vivo',
#  'Processor_Avg_Price_Scaled']
REG_FEATURE_ORDER = [
    'RAM', 'Front Camera', 'Back Camera', 'Battery Capacity', 'Screen Size', 'ROM',
    'Company_Apple', 'Company_Honor', 'Company_Oppo', 'Company_Other', 'Company_Samsung', 'Company_Vivo',
    'Processor_Avg_Price_Scaled'
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
    From Preprocessor.ipynb extract_rom():
    - For TB: returns TB value directly (e.g., "1TB" -> 1.0)
    - For GB: returns GB/1024 to convert to TB (e.g., "256GB" -> 256/1024 = 0.25)
    """
    opt = rom_option.strip().upper()
    if opt.endswith("TB"):
        try:
            # Extract TB value and keep as TB (e.g., "1TB" -> 1.0)
            tb_val = float(opt.replace('TB', '').strip())
            return tb_val
        except Exception:
            return 1.0  # Default 1TB
    else:
        # Extract GB value and convert to TB (e.g., "256GB" -> 256/1024 = 0.25)
        try:
            gb = float(opt.replace('GB', '').strip())
            return gb / 1024.0  # Convert GB to TB (matching notebook)
        except Exception:
            return 0.125  # Default 128GB = 0.125 TB

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

        # Process exactly as notebook: Front Camera and Back Camera are used directly (not divided by 10)
        # From mobile-price-prediction-with-ml.ipynb: clean_numeric(data["Front Camera"], remove_str="MP")
        # CSV shows values like 12.0, 48.0 which are the original MP values
        front_cam_feature = float(front_cam_mp)
        back_cam_feature = float(back_cam_mp)
        
        # Process exactly as notebook: Battery Capacity / 1000
        battery_capacity_feature = float(battery_mah) / 1000.0
        
        # Process features according to modeling_knn_dt_rf_nn (3).ipynb
        # RAM: Use directly (not divided by 4 in new notebook)
        ram_feature = float(request.ram_gb)
        
        # ROM: Convert to TB format (matching preprocessing in mobile-price-prediction-with-ml.ipynb)
        # In CSV after preprocessing: GB values are divided by 1024 to convert to TB
        # So "256GB" -> 0.25 TB, "1TB" -> 1.0 TB
        rom_feature = rom_option_to_reg_feature(request.rom_option)
        
        # Screen Size: Use directly in inches
        screen_size_feature = float(screen_in)

        # Company: Use one-hot encoding (matching new notebook)
        brand_upper = request.brand.strip().title()  # Normalize: "apple" -> "Apple"
        company = {
            'Company_Apple': 1 if brand_upper == 'Apple' else 0,
            'Company_Honor': 1 if brand_upper == 'Honor' else 0,
            'Company_Oppo': 1 if brand_upper == 'Oppo' else 0,
            'Company_Other': 1 if brand_upper not in ['Apple', 'Samsung', 'Oppo', 'Honor', 'Vivo'] else 0,
            'Company_Samsung': 1 if brand_upper == 'Samsung' else 0,
            'Company_Vivo': 1 if brand_upper == 'Vivo' else 0,
        }
        
        # Processor_Avg_Price_Scaled: From create_map.py
        # Formula: Processor_Avg_Price_Scaled = average_price_of_phones_with_this_processor / 100
        # Range in CSV: ~1.29 to ~17.99 (not 0-1!)
        processor_avg_price_scaled = 4.37  # Default fallback (from predict_app.py)
        
        # Try to get from processor_map.pkl first (exact match)
        chip_original = request.chip.strip()
        if processor_map and chip_original in processor_map:
            processor_avg_price_scaled = float(processor_map[chip_original])
            print(f"✅ Found processor '{chip_original}' in map: {processor_avg_price_scaled:.2f}")
        else:
            # Fallback: try fuzzy matching with processor_map keys
            chip_lower = chip_original.lower()
            matched_key = None
            for map_key in processor_map.keys():
                map_key_lower = str(map_key).lower()
                # Check if chip name contains map key or vice versa
                if chip_lower in map_key_lower or map_key_lower in chip_lower:
                    processor_avg_price_scaled = float(processor_map[map_key])
                    matched_key = map_key
                    print(f"✅ Matched processor '{chip_original}' to '{map_key}' in map: {processor_avg_price_scaled:.2f}")
                    break
            
            if matched_key is None:
                # Final fallback: use approximate mapping based on processor tier
                # These are rough estimates based on typical processor prices / 100
                fallback_mapping = {
                    # Apple A-series (premium: $800-1200 -> 8-12)
                    'a17 pro': 11.0, 'a17': 11.0,
                    'a16 bionic': 10.5, 'a16': 10.5,
                    'a15 bionic': 9.5, 'a15': 9.5,
                    'a14 bionic': 9.0, 'a14': 9.0,
                    'a13 bionic': 8.0, 'a13': 8.0,
                    'a12 bionic': 7.5, 'a12': 7.5, 'a12z bionic': 8.5, 'a12z': 8.5,
                    # Snapdragon 8 series (flagship: $700-1100 -> 7-11)
                    'snapdragon 8 gen 3': 10.5, 'sd 8 gen 3': 10.5, '8 gen 3': 10.5,
                    'snapdragon 8 gen 2': 9.5, 'sd 8 gen 2': 9.5, '8 gen 2': 9.5,
                    'snapdragon 8 gen 1': 8.5, 'sd 8 gen 1': 8.5, '8 gen 1': 8.5,
                    'qualcomm snapdragon 8 gen 3': 10.5,
                    'qualcomm snapdragon 8 gen 2': 9.5,
                    'qualcomm snapdragon 8 gen 1': 8.5,
                    # Snapdragon 7 series (mid-high: $400-700 -> 4-7)
                    'snapdragon 7 gen': 5.5, 'sd 7 gen': 5.5, '7 gen': 5.5,
                    # Other premium
                    'kirin 9010': 7.5, 'kirin 9000': 7.0,
                    'google tensor g4': 8.0, 'tensor g4': 8.0,
                    'google tensor g3': 7.0, 'tensor g3': 7.0,
                    # Mid-range ($200-400 -> 2-4)
                    'snapdragon 6': 3.0, 'sd 6': 3.0,
                    'mediatek dimensity': 3.5, 'dimensity': 3.5,
                    'helio': 2.5,
                }
                
                for key, value in fallback_mapping.items():
                    if key in chip_lower or chip_lower in key:
                        processor_avg_price_scaled = value
                        print(f"⚠️ Using fallback mapping for '{chip_original}': {processor_avg_price_scaled:.2f}")
                        break
                else:
                    print(f"⚠️ Processor '{chip_original}' not found in map or fallback, using default {processor_avg_price_scaled:.2f}")
        
        # Debug: Print all feature values
        print(f"\n{'='*60}")
        print("🔍 FEATURE VALUES:")
        print(f"  RAM: {ram_feature} GB")
        print(f"  ROM: {rom_feature} TB (from {request.rom_option})")
        print(f"  Front Camera: {front_cam_feature} (from {front_cam_mp} MP)")
        print(f"  Back Camera: {back_cam_feature} (from {back_cam_mp} MP)")
        print(f"  Battery Capacity: {battery_capacity_feature} (from {battery_mah} mAh)")
        print(f"  Screen Size: {screen_size_feature} inches")
        print(f"  Company: {brand_upper} -> {[k for k, v in company.items() if v == 1]}")
        print(f"  Processor: {request.chip} -> Processor_Avg_Price_Scaled={processor_avg_price_scaled:.4f}")
        print(f"{'='*60}\n")
        
        # Also keep old processor vectors for backward compatibility (if model needs it)
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

        # Get required feature names from model
        required_cols = None
        
        # Check if model is a Pipeline
        from sklearn.pipeline import Pipeline
        is_pipeline = isinstance(model, Pipeline)
        
        print(f"🔍 Model type: {type(model).__name__}, Is Pipeline: {is_pipeline}")
        
        # Try to get feature names from model
        required_cols = None
        if is_pipeline:
            # For Pipeline, try to get from final estimator
            final_estimator = model.steps[-1][1] if hasattr(model, 'steps') else None
            print(f"🔍 Pipeline steps: {[s[0] for s in model.steps] if hasattr(model, 'steps') else 'N/A'}")
            print(f"🔍 Final estimator type: {type(final_estimator).__name__ if final_estimator else 'N/A'}")
            
            if final_estimator and hasattr(final_estimator, 'feature_names_in_'):
                required_cols = list(final_estimator.feature_names_in_)
                print(f"✅ Got feature names from final estimator: {required_cols}")
            # Or try from preprocessor
            elif 'preprocessor' in model.named_steps:
                pre = model.named_steps['preprocessor']
                print(f"🔍 Preprocessor type: {type(pre).__name__}")
                if hasattr(pre, 'named_steps') and 'imputer' in pre.named_steps:
                    imputer = pre.named_steps['imputer']
                    if hasattr(imputer, 'feature_names_in_'):
                        required_cols = list(imputer.feature_names_in_)
                        print(f"✅ Got feature names from imputer: {required_cols}")
        else:
            # Direct model (RandomForestRegressor, etc.)
            if hasattr(model, 'feature_names_in_'):
                required_cols = list(model.feature_names_in_)
                print(f"✅ Got feature names from direct model: {required_cols}")
        
        # Fallback to hardcoded feature order if model doesn't have feature names
        if required_cols is None:
            print("⚠️ Cannot determine feature names from model, using default order")
            required_cols = REG_FEATURE_ORDER.copy()
            # Add Launched Year if model expects it
            if 'Launched Year' not in required_cols:
                required_cols.append('Launched Year')
        else:
            print(f"✅ Using model feature names: {len(required_cols)} features")
        
        # Build feature dictionary first
        feature_dict = {}
        
        # Map our inputs to model's expected features
        for col in required_cols:
            if col == 'RAM':
                feature_dict[col] = ram_feature
            elif col == 'Screen Size':
                feature_dict[col] = screen_size_feature
            elif col == 'ROM':
                feature_dict[col] = rom_feature
            elif col == 'Front Camera':
                feature_dict[col] = front_cam_feature
            elif col == 'Back Camera':
                feature_dict[col] = back_cam_feature
            elif col == 'Battery Capacity':
                feature_dict[col] = battery_capacity_feature
            elif col.startswith('Company_'):
                # New model uses one-hot encoding for Company
                feature_dict[col] = company.get(col, 0)
            elif col == 'Processor_Avg_Price_Scaled':
                # New model uses Processor_Avg_Price_Scaled
                feature_dict[col] = processor_avg_price_scaled
            elif col == 'Company_encoded':
                # Old model format (backward compatibility)
                feature_dict[col] = 0.0  # Not used in new model
            elif col == 'Processor_encoded':
                # Old model format (backward compatibility)
                feature_dict[col] = 0.0  # Not used in new model
            elif col.startswith('Processor_vec'):
                # Old model format (backward compatibility)
                vec_num = int(col.replace('Processor_vec', ''))
                if vec_num == 1:
                    feature_dict[col] = proc_vec1 if 'proc_vec1' in locals() else 0.0
                elif vec_num == 2:
                    feature_dict[col] = proc_vec2 if 'proc_vec2' in locals() else 0.0
                elif vec_num == 3:
                    feature_dict[col] = proc_vec3 if 'proc_vec3' in locals() else 0.0
                else:
                    feature_dict[col] = 0.0
            elif col == 'Launched Year':
                feature_dict[col] = 2024  # Default to current year
            else:
                # Unknown column - set to 0
                feature_dict[col] = 0.0
        
        # Build DataFrame with feature names in exact order
        # This ensures feature names match what model expects
        # Create DataFrame with proper column names to avoid sklearn warning
        # Important: Create DataFrame with columns in the exact order model expects
        X_in = pd.DataFrame([feature_dict], columns=required_cols)
        
        # Verify all required columns are present
        missing_cols = set(required_cols) - set(X_in.columns)
        if missing_cols:
            print(f"⚠️ Missing columns: {missing_cols}, filling with 0")
            for col in missing_cols:
                X_in[col] = 0.0
        
        # Ensure column order matches exactly
        X_in = X_in[required_cols]
        
        # Debug: Print feature names to verify
        print(f"🔍 Predicting with {len(required_cols)} features")
        print(f"   All columns: {list(X_in.columns)}")
        print(f"   DataFrame shape: {X_in.shape}")
        print(f"   Column names match: {X_in.columns.tolist() == required_cols}")
        
        # Predict USD (regression)
        # IMPORTANT: Model from modeling_knn_dt_rf_nn (3).ipynb uses 'Launched Price (USA)' directly (not divided by 100)
        # So model output is already in USD, no need to multiply by 100
        try:
            # Suppress sklearn warnings about feature names if they don't match exactly
            import warnings
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", message="X does not have valid feature names")
                warnings.filterwarnings("ignore", category=UserWarning)
                
                # Check if model is a Pipeline (from notebook, model is saved as Pipeline)
                # Pipeline contains: preprocessor (SimpleImputer + StandardScaler) + model
                # If it's a Pipeline, it will automatically apply preprocessing
                print(f"🔍 About to predict with DataFrame shape: {X_in.shape}")
                print(f"🔍 DataFrame columns: {list(X_in.columns)}")
                print(f"🔍 DataFrame dtypes:\n{X_in.dtypes}")
                
                if is_pipeline:
                    # Pipeline expects raw features (not pre-scaled)
                    # It will apply imputer and scaler internally
                    # Note: Pipeline may not preserve feature names, so we pass DataFrame directly
                    print("🔍 Using Pipeline.predict()")
                else:
                    # Direct model - use as is (RandomForestRegressor from new notebook)
                    print("🔍 Using direct model.predict()")
                
                prediction_result = model.predict(X_in)
                print(f"🔍 Prediction result type: {type(prediction_result)}, shape: {prediction_result.shape if hasattr(prediction_result, 'shape') else 'N/A'}")
                
                # Model output is already in USD (not normalized)
                price_usd = float(prediction_result[0])
                print(f"\n{'='*60}")
                print(f"💰 PREDICTION RESULT:")
                print(f"  Price (USD): ${price_usd:.2f}")
                print(f"  Price (VND): {int(price_usd * 25000):,} VND")
                print(f"{'='*60}\n")
        except Exception as e:
            import traceback
            error_detail = f"Model predict failed: {str(e)}\n{traceback.format_exc()}"
            print(f"❌ Prediction error details:\n{error_detail}")
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
        import traceback
        error_detail = f"Prediction error: {str(e)}\n{traceback.format_exc()}"
        print(f"❌ Full error traceback:\n{error_detail}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting API server at http://localhost:8000")
    print("📚 API docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)



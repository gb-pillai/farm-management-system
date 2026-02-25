import sys
import joblib
import numpy as np
import os

try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    le_crop = joblib.load(os.path.join(BASE_DIR, "le_crop.pkl"))
    le_district = joblib.load(os.path.join(BASE_DIR, "le_district.pkl"))
    le_season = joblib.load(os.path.join(BASE_DIR, "le_season.pkl"))
    model = joblib.load(os.path.join(BASE_DIR, "kerala_yield_model.pkl"))

    crop = sys.argv[1].strip()
    district = sys.argv[2].strip()
    season = sys.argv[3].strip()
    area = float(sys.argv[4])
    year = int(sys.argv[5])

    # Encode
    district_encoded = le_district.transform([district])[0]
    crop_encoded = le_crop.transform([crop])[0]
    season_encoded = le_season.transform([season])[0]

    # EXACT SAME ORDER AS TRAINING
    features = np.array([[
        district_encoded,
        crop_encoded,
        season_encoded,
        year,
        area
    ]])

    yield_per_hectare = model.predict(features)[0]

    total_production_tonnes = yield_per_hectare * area
    total_production_kg = total_production_tonnes * 1000

    print(total_production_kg)

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
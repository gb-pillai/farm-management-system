import sys
import joblib
import numpy as np
import os
import pandas as pd
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    model = joblib.load(os.path.join(BASE_DIR, "kerala_yield_model.pkl"))
    le_crop = joblib.load(os.path.join(BASE_DIR, "le_crop.pkl"))
    le_district = joblib.load(os.path.join(BASE_DIR, "le_district.pkl"))
    le_season = joblib.load(os.path.join(BASE_DIR, "le_season.pkl"))

    crop = sys.argv[1].strip()
    district = sys.argv[2].strip()
    season = sys.argv[3].strip()
    area = float(sys.argv[4])
    year = int(sys.argv[5])

    # Match training format
    crop = crop.capitalize()
    district = district.upper()
    season = season.capitalize()

    # Validation
    if crop not in le_crop.classes_:
        raise ValueError(f"Unsupported Crop: {crop}")

    if district not in le_district.classes_:
        raise ValueError(f"Unsupported District: {district}")

    if season not in le_season.classes_:
        raise ValueError(f"Unsupported Season: {season}")

    # Encode inputs
    crop_encoded = le_crop.transform([crop])[0]
    district_encoded = le_district.transform([district])[0]
    season_encoded = le_season.transform([season])[0]

    # ✅ Correct feature order (NO AREA inside model)


    features = pd.DataFrame([{
        "Crop": crop_encoded,
        "District": district_encoded,
        "Season": season_encoded,
        "Year": year
    }])

    # Predict yield per hectare (tonnes/hectare)
    predicted_yield_per_hectare = model.predict(features)[0]

    # Multiply by area to get total production
    total_tonnes = predicted_yield_per_hectare * area

    # Convert to kilograms
    total_kg = total_tonnes * 1000

    print(round(total_kg, 2))

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
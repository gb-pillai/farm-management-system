import sys
import joblib
import numpy as np
import os

try:
    # Get current directory
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # Load encoders and model
    le_crop = joblib.load(os.path.join(BASE_DIR, "le_crop.pkl"))
    le_district = joblib.load(os.path.join(BASE_DIR, "le_district.pkl"))
    le_season = joblib.load(os.path.join(BASE_DIR, "le_season.pkl"))
    model = joblib.load(os.path.join(BASE_DIR, "kerala_yield_model.pkl"))

    # Read arguments from Node
    crop = sys.argv[1]
    district = sys.argv[2]
    season = sys.argv[3]
    area = float(sys.argv[4])
    year = int(sys.argv[5])

    # Normalize inputs
    crop = crop.strip()
    district = district.strip().upper()
    season = season.strip()

    # Encode categorical features
    crop_encoded = le_crop.transform([crop])[0]
    district_encoded = le_district.transform([district])[0]
    season_encoded = le_season.transform([season])[0]

    # Feature order MUST match training
    features = np.array([[crop_encoded, district_encoded, season_encoded, area, year]])

    # Predict yield per hectare (likely in tonnes)
    prediction = model.predict(features)
    yield_per_hectare = prediction[0]

    # Calculate total production
    total_production_tonnes = yield_per_hectare * area

    # Convert tonnes to kg
    total_production_kg = total_production_tonnes * 1000

    # Print ONLY ONE value (important)
    print(total_production_kg)

except Exception as e:
    # If any error happens, print it clearly for Node
    print(f"ERROR: {str(e)}")
    sys.exit(1)
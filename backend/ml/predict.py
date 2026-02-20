import sys
import joblib
import numpy as np
import os

# Get current file directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load models using absolute path
model = joblib.load(os.path.join(BASE_DIR, "yield_model.pkl"))
crop_encoder = joblib.load(os.path.join(BASE_DIR, "le_crop.pkl"))
district_encoder = joblib.load(os.path.join(BASE_DIR, "le_district.pkl"))
season_encoder = joblib.load(os.path.join(BASE_DIR, "le_season.pkl"))

# Get arguments from Node
crop = sys.argv[1]
district = sys.argv[2]
season = sys.argv[3]
area = float(sys.argv[4])
rainfall = float(sys.argv[5])
temperature = float(sys.argv[6])
humidity = float(sys.argv[7])

# Encode categorical values
crop_encoded = crop_encoder.transform([crop])[0]
district_encoded = district_encoder.transform([district])[0]
season_encoded = season_encoder.transform([season])[0]

# Prepare input array
features = np.array([[crop_encoded, district_encoded, season_encoded, area, rainfall, temperature, humidity]])

prediction = model.predict(features)

print(prediction[0])
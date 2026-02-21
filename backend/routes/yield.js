const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const YieldPrediction = require("../models/YieldPrediction");

router.post("/predict", async (req, res) => {
  try {
    let { farmId, crop, district, season, area, year } = req.body;

    // ✅ Normalize input before sending to Python
    crop = crop?.trim();
    district = district?.trim();
    season = season?.trim();
    area = Number(area);
    year = Number(year);

    if (!crop || !district || !season || !area || !year) {
      return res.status(400).json({
        error: "Missing required prediction fields"
      });
    }

    // Capitalize crop properly (Rice, Wheat, Coconut)
    crop =
      crop.charAt(0).toUpperCase() +
      crop.slice(1).toLowerCase();

    // District uppercase (KANNUR)
    district = district.toUpperCase();

    // Season title case (Kharif / Rabi / Whole Year)
    season =
      season.charAt(0).toUpperCase() +
      season.slice(1).toLowerCase();

    const pythonPath = path.join(__dirname, "../ml/predict.py");

    const python = spawn("python", [
      pythonPath,
      crop,
      district,
      season,
      area.toString(),
      year.toString()
    ]);

    let result = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", async (code) => {
  console.log("Python Raw Output:", result);
  console.log("Python Error Output:", errorOutput);

  const predictedValue = Number(result.trim());

  if (isNaN(predictedValue)) {
    return res.status(400).json({
      error: "Invalid prediction value from Python",
      rawOutput: result,
      pythonError: errorOutput
    });
  }

  try {
    const saved = await YieldPrediction.create({
      farmId,
      cropType: crop,
      district,
      season,
      area,
      year,
      predictedYield: predictedValue,
    });

    return res.json(saved);
  } catch (dbError) {
    console.error("Database Save Error:", dbError);
    return res.status(500).json({
      error: "Failed to save prediction"
    });
  }
});

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Prediction failed" });
  }
});

router.get("/farm/:id", async (req, res) => {
  try {
    const data = await YieldPrediction
      .find({ farmId: req.params.id })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    console.error("History Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
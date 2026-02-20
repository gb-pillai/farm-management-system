const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const YieldPrediction = require("../models/YieldPrediction");

router.post("/predict", async (req, res) => {
  try {
    const { farmId, crop, district, season, area, year } = req.body;

    const pythonPath = path.join(__dirname, "../ml/predict.py");

    const python = spawn("python", [
      pythonPath,
      crop,
      district,
      season,
      area,
      year
    ]);

    let result = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error("Python Error:", data.toString());
    });

    python.on("close", async () => {
      const predictedValue = Number(result.trim());

      const saved = await YieldPrediction.create({
        farmId,
        cropType: crop,
        district,
        season,
        area,
        year,
        predictedYield: predictedValue,
      });

      res.json(saved);
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Prediction failed" });
  }
});

router.get("/farm/:id", async (req, res) => {
  const data = await YieldPrediction.find({ farmId: req.params.id }).sort({ createdAt: -1 });
  res.json(data);
});

module.exports = router;
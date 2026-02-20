const express = require("express");
const router = express.Router();
const YieldPrediction = require("../models/YieldPrediction");

// POST route
const { spawn } = require("child_process");
const path = require("path");

router.post("/predict", (req, res) => {
  const { crop, district, season, area, rainfall, temperature, humidity } = req.body;

  const pythonPath = path.join(__dirname, "../ml/predict.py");

  const python = spawn("python", [
    pythonPath,
    crop,
    district,
    season,
    area,
    rainfall,
    temperature,
    humidity,
  ]);

  let result = "";

  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("Python Error:", data.toString());
  });

  python.on("close", () => {
    res.json({ predictedYield: result.trim() });
  });
});

// GET route
router.get("/farm/:farmId", async (req, res) => {
  try {
    const predictions = await YieldPrediction
      .find({ farmId: req.params.farmId })
      .sort({ createdAt: -1 });

    res.json(predictions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
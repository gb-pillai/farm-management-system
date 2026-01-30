const express = require("express");
const router = express.Router();

const fertilizers = require("../data/fertilizers");
const getNextDate = require("../utils/dateCalc");
const decideInterval = require("../utils/intervalDecision");

router.post("/next-date", (req, res) => {
  const { crop, stage, lastDate, farmerInterval } = req.body;

  if (!fertilizers[crop] || !fertilizers[crop][stage]) {
    return res.status(400).json({ message: "Invalid crop or stage" });
  }

  const datasetInterval = fertilizers[crop][stage].interval;

  const decision = decideInterval(
    datasetInterval,
    farmerInterval
  );

  const nextDate = getNextDate(
    lastDate,
    decision.finalDays
  );

  res.json({
    source: "dataset + farmer",
    crop,
    stage,
    datasetInterval,
    usedInterval: decision.finalDays,
    message: decision.message,
    nextDate
  });
});

module.exports = router;

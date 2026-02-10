const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Income = require("../models/Income");

// ✅ ADD INCOME
router.post("/add", async (req, res) => {
  try {
    const income = new Income(req.body);
    await income.save();

    res.json({
      success: true,
      income,
    });
  } catch (error) {
    console.error("Add income error:", error.message);
    res.status(500).json({ success: false });
  }
});

// ✅ GET INCOME BY FARM
router.get("/farm/:farmId", async (req, res) => {
  try {
    const income = await Income.find({
      farmId: new mongoose.Types.ObjectId(req.params.farmId),
    });

    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

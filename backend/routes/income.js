const express = require("express");
const router = express.Router();
const Income = require("../models/Income");

// ✅ ADD INCOME (MANUAL ENTRY AFTER SALE)
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
    const data = await Income.find({ farmId: req.params.farmId })
      .sort({ soldDate: -1 });

    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;

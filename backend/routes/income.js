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

// ✅ GET SINGLE INCOME
router.get("/:id", async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    res.json({ success: true, income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE INCOME
router.put("/:id", async (req, res) => {
  try {
    const updated = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Income not found" });
    res.json({ success: true, income: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE INCOME
router.delete("/:id", async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;

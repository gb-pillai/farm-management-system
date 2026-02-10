const express = require("express");
const router = express.Router();
const Farm = require("../models/Farm");
const Fertilizer = require("../models/Fertilizer");

// GET DASHBOARD SUMMARY
router.get("/summary", async (req, res) => {
  try {
    const totalFarms = await Farm.countDocuments();
    const totalFertilizers = await Fertilizer.countDocuments();

    const today = new Date();
    const fertilizers = await Fertilizer.find();

    let overdue = 0;
    let dueSoon = 0;

    fertilizers.forEach(f => {
      if (!f.nextDueDate) return;

      const diff = new Date(f.nextDueDate) - today;

      if (diff < 0) overdue++;
      else if (diff <= 3 * 24 * 60 * 60 * 1000) dueSoon++;
    });

    res.json({
      totalFarms,
      totalFertilizers,
      overdue,
      dueSoon,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

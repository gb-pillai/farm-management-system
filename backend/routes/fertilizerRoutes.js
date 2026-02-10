const express = require("express");
const router = express.Router();
const Fertilizer = require("../models/Fertilizer");
// ✅ SAFE ADD FERTILIZER ROUTE
router.post("/add", async (req, res) => {
  try {
    const {
      fertilizerName,
      quantity,
      unit,
      appliedDate,
      intervalDays,
      notes,
      farmId,
      userId,
      cropName,
    } = req.body;

    // 🔐 REQUIRED FIELD CHECK
    if (
      !userId ||
      !farmId ||
      !fertilizerName ||
      quantity == null ||
      !appliedDate
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // 📅 Applied date validation
    const applied = new Date(appliedDate);
    if (isNaN(applied)) {
      return res.status(400).json({
        error: "Invalid applied date",
      });
    }

    if (applied > new Date()) {
      return res.status(400).json({
        error: "Applied date cannot be in the future",
      });
    }

    // 🔢 Interval validation
    if (intervalDays != null && intervalDays <= 0) {
      return res.status(400).json({
        error: "Interval days must be greater than 0",
      });
    }

    // 🧠 Calculate next due date
    let nextDueDate = null;
    if (intervalDays) {
      nextDueDate = new Date(
        applied.getTime() + intervalDays * 24 * 60 * 60 * 1000
      );
    }

    const fertilizer = new Fertilizer({
      userId,
      farmId,
      fertilizerName,
      quantity,
      unit: unit || "kg",
      cropName,
      appliedDate: applied,
      intervalDays,
      nextDueDate,
      notes,
    });

    await fertilizer.save();

    res.status(201).json({
      success: true,
      message: "Fertilizer added successfully",
      data: fertilizer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error while adding fertilizer",
    });
  }
});


// ✅ GET FERTILIZERS BY FARM
router.get("/farm/:farmId", async (req, res) => {
  try {
    const fertilizers = await Fertilizer.find({
      farmId: req.params.farmId,
    }).sort({ appliedDate: -1 });

    res.json(fertilizers);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch fertilizers",
    });
  }
});

router.get("/status", async (req, res) => {
  const today = new Date();

  const fertilizers = await Fertilizer.find();

  let normal = 0, dueSoon = 0, overdue = 0;

  fertilizers.forEach(f => {
    if (!f.nextDueDate) return;

    const diff = new Date(f.nextDueDate) - today;

    if (diff < 0) overdue++;
    else if (diff <= 3 * 24 * 60 * 60 * 1000) dueSoon++;
    else normal++;
  });

  res.json({ normal, dueSoon, overdue });
});


module.exports = router;

const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// ✅ ADD EXPENSE
router.post("/add", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();

    res.json({
      success: true,
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("Expense save error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET EXPENSES BY FARM
router.get("/farm/:farmId", async (req, res) => {
  try {
    const expenses = await Expense.find({
      farmId: req.params.farmId,
    });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ✅ GET EXPENSES BY USER (ALL FARMS)
router.get("/user/:userId", async (req, res) => {
  try {
    const expenses = await Expense.find({
        userId: req.params.userId,
    }).populate("farmId", "farmName");


    res.json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Get expenses by user error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ CATEGORY-WISE EXPENSE (FOR BAR GRAPH)
router.get("/analytics/category/:farmId", async (req, res) => {
  try {
    const { farmId } = req.params;

    const data = await Expense.aggregate([
      {
        $match: {
          farmId: new mongoose.Types.ObjectId(farmId),
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Category analytics error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category analytics",
    });
  }
});


// ✅ DELETE EXPENSE
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

// ✅ GET SINGLE EXPENSE
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    res.json({ success: true, expense });
  } catch {
    res.status(404).json({ success: false });
  }
});

// ✅ UPDATE EXPENSE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, updated });
  } catch {
    res.status(500).json({ success: false });
  }
});


module.exports = router;

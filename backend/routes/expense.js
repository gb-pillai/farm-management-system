const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

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

module.exports = router;

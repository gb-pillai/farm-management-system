const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// ✅ EXPENSE BY CATEGORY
router.get("/expenses/category/:farmId", async (req, res) => {
  try {
    const { farmId } = req.params;

    const data = await Expense.aggregate([
      { $match: { farmId: new mongoose.Types.ObjectId(farmId) } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get category-wise expense"
    });
  }
});

// ✅ MONTHLY EXPENSE TREND
router.get("/expenses/monthly/:farmId", async (req, res) => {
  try {
    const { farmId } = req.params;

    const data = await Expense.aggregate([
      {
        $match: {
          farmId: new mongoose.Types.ObjectId(farmId)
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$expenseDate" },
            month: { $month: "$expenseDate" }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get monthly expense"
    });
  }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const Farm = require("../models/Farm");
const Fertilizer = require("../models/Fertilizer");
const Income = require("../models/Income");


/* =====================================================
   FARM-LEVEL ANALYTICS (EXISTING – KEPT)
===================================================== */


// ✅ FARM PROFIT SUMMARY (REAL-TIME)
router.get("/farm/profit/:farmId", async (req, res) => {
  try {
    const { farmId } = req.params;
    const farmObjectId = new mongoose.Types.ObjectId(farmId);

    // 🔴 TOTAL EXPENSE (from Expense collection)
    const expenseAgg = await Expense.aggregate([
      { $match: { farmId: farmObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpense = expenseAgg[0]?.total || 0;

    // 🟢 TOTAL INCOME (from Income collection)
    const incomeAgg = await Income.aggregate([
      { $match: { farmId: farmObjectId } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

const totalIncome = incomeAgg[0]?.total || 0;


    const profit = totalIncome - totalExpense;

    res.json({
      success: true,
      totalExpense,
      totalIncome,
      profit
    });
  } catch (error) {
    console.error("Farm profit error:", error.message);
    res.status(500).json({ success: false });
  }
});


// ✅ EXPENSE BY CATEGORY (PER FARM)
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

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get category-wise expense"
    });
  }
});

// ✅ MONTHLY EXPENSE TREND (PER FARM)
router.get("/expenses/monthly/:farmId", async (req, res) => {
  try {
    const { farmId } = req.params;

    const data = await Expense.aggregate([
      { $match: { farmId: new mongoose.Types.ObjectId(farmId) } },
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

/* =====================================================
   DASHBOARD ANALYTICS (NEW – USER LEVEL)
===================================================== */

// ✅ DASHBOARD: EXPENSE BREAKDOWN (ALL FARMS)
router.get("/dashboard/expenses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});
// ✅ DASHBOARD: PROFIT PER FARM (REAL)
router.get("/dashboard/profit/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const farms = await Farm.find({ userId });

    const data = [];

    for (const farm of farms) {
      const income = await Income.aggregate([
        { $match: { farmId: farm._id } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);

      const expense = await Expense.aggregate([
        { $match: { farmId: farm._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const totalIncome = income[0]?.total || 0;
      const totalExpense = expense[0]?.total || 0;

      data.push({
        farmId: farm._id,
        farmName: farm.farmName,
        profit: totalIncome - totalExpense
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// ✅ DASHBOARD: FERTILIZER STATUS (NORMAL / DUE / OVERDUE)
router.get("/dashboard/fertilizer-status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();

    const fertilizers = await Fertilizer.find({ userId });

    let normal = 0;
    let dueSoon = 0;
    let overdue = 0;

    fertilizers.forEach(f => {
      const diff =
        (new Date(f.nextDueDate) - today) / (1000 * 60 * 60 * 24);

      if (diff < 0) overdue++;
      else if (diff <= 7) dueSoon++;
      else normal++;
    });

    res.json({
      success: true,
      data: { normal, dueSoon, overdue }
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ✅ DASHBOARD: FERTILIZER USAGE PER FARM
router.get("/dashboard/fertilizer-usage/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const farms = await Farm.find({ userId });

    const data = await Promise.all(
      farms.map(async farm => {
        const count = await Fertilizer.countDocuments({
          farmId: farm._id
        });

        return {
          farmName: farm.farmName,
          applications: count
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});


router.get("/profit-per-farm", async (req, res) => {
  const farms = await Farm.find();

  const result = await Promise.all(
    farms.map(async farm => {
      const income = await Income.aggregate([
        { $match: { farmId: farm._id } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);

      const expense = await Expense.aggregate([
        { $match: { farmId: farm._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      return {
        farm: farm.farmName,
        profit:
          (income[0]?.total || 0) - (expense[0]?.total || 0),
      };
    })
  );

  res.json(result);
});


router.get("/fertilizer-usage", async (req, res) => {
  const data = await Fertilizer.aggregate([
    {
      $group: {
        _id: "$farmId",
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "farms",
        localField: "_id",
        foreignField: "_id",
        as: "farm"
      }
    },
    { $unwind: "$farm" },
    {
      $project: {
        farm: "$farm.farmName",
        count: 1
      }
    }
  ]);

  res.json(data);
});


module.exports = router;

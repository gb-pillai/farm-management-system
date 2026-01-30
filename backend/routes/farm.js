const express = require("express");
const router = express.Router();
const Farm = require("../models/Farm");

/*
  Phase-2 Farm Routes
  ------------------
  - Add farm data (MongoDB)
  - View farms of a user
*/

// -------------------- ADD FARM --------------------
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      farmName,
      location,
      areaInAcres,
      cropName,
      season,
      yieldAmount,
      profit
    } = req.body;

    if (!userId || !farmName || !location || !areaInAcres || !cropName || !season) {
      return res.status(400).json({
        success: false,
        message: "Required farm details are missing"
      });
    }

    const newFarm = new Farm({
      userId,
      farmName,
      location,
      areaInAcres,
      cropName,
      season,
      yieldAmount,
      profit
    });

    await newFarm.save();

    res.status(201).json({
      success: true,
      message: "Farm added successfully",
      data: newFarm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// -------------------- GET FARMS BY USER --------------------
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const farms = await Farm.find({ userId });

    res.json({
      success: true,
      data: farms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// -------------------- GET FARM BY ID --------------------
router.get("/details/:farmId", async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found"
      });
    }

    res.json({
      success: true,
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});


module.exports = router;

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
      cropName, // legacy frontend
      crops,    // new frontend
      season,
      yieldAmount,
      profit
    } = req.body;

    // Convert legacy cropName to crops array if crops isn't provided
    let finalCrops = crops || (cropName ? [cropName] : []);

    // Ensure backwards compatibility by converting strings to objects
    finalCrops = finalCrops.map(crop => {
      if (typeof crop === "string") {
        return {
          name: crop,
          season: season || "Unknown",
          status: "Growing"
        };
      }
      return crop;
    });

    if (!userId || !farmName || !location || !areaInAcres || finalCrops.length === 0 || !season) {
      return res.status(400).json({
        success: false,
        message: `Required farm details missing. Provided: userId=${!!userId}, farmName=${!!farmName}, location=${!!location}, areaInAcres=${!!areaInAcres}, cropsLength=${finalCrops.length}, season=${!!season}`
      });
    }

    const newFarm = new Farm({
      userId,
      farmName,
      location,
      areaInAcres,
      crops: finalCrops,
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

// GET single farm
router.get("/:id", async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }

    res.json(farm);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;

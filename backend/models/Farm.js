const mongoose = require("mongoose");

const FarmSchema = new mongoose.Schema(
  {
    // Link farm to the farmer (user)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Basic farm details
    farmName: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true
    },

    // Land size in acres
    areaInAcres: {
      type: Number,
      required: true,
      min: 0
    },

    // Crop details (Kerala focused)
    cropName: {
      type: String,
      required: true
    },

    // Simple seasons for Kerala farmers
    season: {
      type: String,
      enum: ["Monsoon", "Post-Monsoon", "Summer"],
      required: true
    },

    // Production & income details
    yieldAmount: {
      type: Number,
      min: 0
    },

    profit: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Farm", FarmSchema);

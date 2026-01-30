const mongoose = require("mongoose");

const FertilizerSchema = new mongoose.Schema(
  {
    // Link fertilizer usage to the farmer
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Link fertilizer usage to a specific farm
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    // Fertilizer details
    fertilizerName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["kg", "g", "litre"],
      default: "kg",
    },

    // Crop on which fertilizer is applied
    cropName: {
      type: String,
      required: true,
    },

    // Date of application
    appliedDate: {
      type: Date,
      required: true,
    },

    // ✅ NEW (SAFE): Interval between applications
    intervalDays: {
      type: Number,
      default: 7, // safe default for existing data
      min: 1,
    },

    // ✅ NEW (SAFE): Next fertilizer due date
    nextDueDate: {
      type: Date,
      default: null, // old records won't break
    },

    // Optional notes for farmers
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fertilizer", FertilizerSchema);

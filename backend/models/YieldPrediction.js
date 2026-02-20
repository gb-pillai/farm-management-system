const mongoose = require("mongoose");

const yieldSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },
  cropType: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  predictedYield: {
    type: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model("YieldPrediction", yieldSchema);
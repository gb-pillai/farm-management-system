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
  area: {
    type: Number,
    required: true,
  },
  rainfall: Number,
  temperature: Number,
  humidity: Number,
  fertilizer: Number,
  predictedYield: Number,
}, { timestamps: true });

module.exports = mongoose.model("YieldPrediction", yieldSchema);
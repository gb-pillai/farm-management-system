const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cropName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number, // kg / quintal / ton
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    soldDate: {
      type: Date,
      required: true,
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Income", incomeSchema);

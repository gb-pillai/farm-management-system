const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["Seed", "Fertilizer", "Labor", "Machinery", "Other"],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    expenseDate: {
      type: Date,
      default: Date.now
    },
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);

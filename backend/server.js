const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Auth routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Farm routes
const farmRoutes = require("./routes/farm");
app.use("/api/farm", farmRoutes);

// Farmer-entered fertilizers (MongoDB)
const fertilizerRoutes = require("./routes/fertilizerRoutes");
app.use("/api/fertilizer", fertilizerRoutes);

// Dataset-based recommendation engine
const recommendationRoutes = require("./routes/recommendation");
app.use("/api/recommendation", recommendationRoutes);

// Test
app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

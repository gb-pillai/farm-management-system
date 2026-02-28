import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "./FarmDetails.css";

function FarmDetails() {
  const [uiMessage, setUiMessage] = useState("");
  const [uiType, setUiType] = useState("");
  const [applying, setApplying] = useState(false);
  const userId = localStorage.getItem("userId");

  const { farmId } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [fertilizers, setFertilizers] = useState([]);
  const [fertilizerName, setFertilizerName] = useState("Urea");

  // 🔹 Recommendation states
  const [stage, setStage] = useState("");
  const [availableStages, setAvailableStages] = useState([]); // ✅ NEW
  const [lastDate, setLastDate] = useState("");
  const [farmerInterval, setFarmerInterval] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  // 🔹 Multiple Crops Selection
  const [selectedCrop, setSelectedCrop] = useState("");

  // Weather
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const [weather, setWeather] = useState(null);

  // ================= WEATHER =================
  useEffect(() => {
    const fetchWeather = async () => {
      if (farm?.location) {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${farm.location},IN&units=metric&appid=${API_KEY}`
        );
        setWeather(response.data);
      }
    };
    fetchWeather();
  }, [farm?.location, API_KEY]); // ✅ fixed dependency

  // ================= FETCH FARM =================
  useEffect(() => {
    fetch(`http://localhost:5000/api/farm/details/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFarm(data.data);
          // Set initial active crop
          if (data.data.crops && data.data.crops.length > 0) {
            const firstCrop = data.data.crops[0];
            setSelectedCrop(firstCrop.name || firstCrop);
          } else if (data.data.cropName) {
            setSelectedCrop(data.data.cropName);
          }
        }
      });

    fetch(`http://localhost:5000/api/fertilizer/farm/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        setFertilizers(data);
      });
  }, [farmId]);

  // ================= LOAD STAGES DYNAMICALLY =================
  useEffect(() => {
    if (!selectedCrop) return;

    fetch("http://localhost:5000/api/recommendation/stages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        crop: selectedCrop.toLowerCase(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.stages) {
          setAvailableStages(data.stages);
          setStage(""); // reset stage when crop loads
        }
      });
  }, [selectedCrop]); // ✅ Depends on selectedCrop now

  // ================= CALCULATE =================
  const calculateRecommendation = async () => {
    if (!stage || !lastDate) {
      alert("Please enter stage and last fertilizer date");
      return;
    }

    setLoadingRec(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/recommendation/next-date",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop: selectedCrop.toLowerCase(),
            stage,
            fertilizer: fertilizerName.toLowerCase(),
            lastDate,
            farmerInterval: farmerInterval ? Number(farmerInterval) : undefined,
            location: farm.location // ✅ ADD THIS
          }),
        }
      );

      const data = await res.json();
      setRecommendation(data);
    } catch {
      alert("Failed to calculate recommendation");
    }

    setLoadingRec(false);
  };

  const applyRecommendation = async () => {
    setApplying(true);
    setUiMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/fertilizer/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            farmId: farm._id,
            fertilizerName,
            appliedDate: lastDate,
            intervalDays: recommendation.usedInterval,
            quantity: 1,
            unit: "kg",
            cropName: selectedCrop,
            notes: recommendation.message,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setUiType("error");
        setUiMessage(data.error || "Failed to apply recommendation");
        setApplying(false);
        return;
      }

      setUiType("success");
      setUiMessage("✅ Recommendation applied successfully");

      const historyRes = await fetch(
        `http://localhost:5000/api/fertilizer/farm/${farmId}`
      );
      const historyData = await historyRes.json();
      setFertilizers(historyData);

      setRecommendation(null);
    } catch {
      setUiType("error");
      setUiMessage("❌ Server error while applying recommendation");
    }

    setApplying(false);
  };

  if (!farm) return <p>Loading farm details...</p>;

  return (
    <div className="farm-details-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>

      {weather && (
        <div className="weather-card">
          <div className="weather-header">
            <h3>🌤 Farm Weather</h3>
            <span className="weather-condition">
              {weather.weather[0].description}
            </span>
          </div>
          <div className="weather-main">
            <div className="temperature">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="weather-details">
              <p>💧 Humidity: {weather.main.humidity}%</p>
              <p>🌡 Feels Like: {Math.round(weather.main.feels_like)}°C</p>
            </div>
          </div>
        </div>
      )}

      {/* FARM HEADER */}
      <div className="farm-header card">
        <h2>{farm.farmName}</h2>
        <div className="farm-meta">
          <p><strong>Location:</strong> {farm.location}</p>
          <p><strong>Area:</strong> {farm.areaInAcres} acres</p>
          <p><strong>Primary Season:</strong> {farm.season}</p>
        </div>

        <h4 style={{ marginTop: "15px", marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Active Crops</h4>
        <div style={{ display: "grid", gap: "10px" }}>
          {farm.crops && farm.crops.length > 0 ? farm.crops.map((crop, idx) => (
            <div key={idx} style={{ padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px", borderLeft: "4px solid #4CAF50", color: "#333" }}>
              <strong style={{ color: "#222" }}>{crop.name || crop}</strong>
              {crop.season && <span style={{ marginLeft: "10px", fontSize: "0.85rem", color: "#666" }}>({crop.season})</span>}
              <div style={{ marginTop: "5px", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", color: "#444" }}>
                <span style={{ color: "#444" }}>🌱 Sown: {crop.sownDate ? new Date(crop.sownDate).toLocaleDateString() : 'N/A'}</span>
                <span style={{ color: "#444" }}>🌾 Harvest: {crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString() : 'N/A'}</span>
                <span style={{ fontWeight: "bold", color: crop.status === "Harvested" ? "#ff9800" : "#4CAF50" }}>
                  Status: {crop.status || "Growing"}
                </span>
              </div>
            </div>
          )) : <p>{farm.cropName}</p>}
        </div>
      </div>

      {/* FERTILIZER HISTORY */}
      <div className="card">
        <h3>🌱 Fertilizer History</h3>

        {fertilizers.length === 0 ? (
          <p className="empty-text">No fertilizer records found</p>
        ) : (
          fertilizers.map((f) => {
            const today = new Date();
            let status = "normal";

            if (!f.nextDueDate) status = "no-date";
            else {
              const dueDate = new Date(f.nextDueDate);
              if (dueDate < today) status = "overdue";
              else if (dueDate - today <= 3 * 24 * 60 * 60 * 1000)
                status = "due-soon";
            }

            return (
              <div key={f._id} className="fertilizer-card">
                <div className="fert-header">
                  <span className="fert-name">
                    {f.fertilizerName} – {f.quantity} {f.unit}
                  </span>
                  <span className={`status-badge ${status}`}>
                    {status === "overdue" && "🔴 Overdue"}
                    {status === "due-soon" && "🟡 Due Soon"}
                    {status === "normal" && "🟢 Normal"}
                    {status === "no-date" && "⚠️ No Schedule"}
                  </span>
                </div>

                <p>📅 Applied: {new Date(f.appliedDate).toDateString()}</p>

                {f.nextDueDate && (
                  <p>📅 Next Due: {new Date(f.nextDueDate).toDateString()}</p>
                )}

                {f.notes && <p className="notes">📝 {f.notes}</p>}
              </div>
            );
          })
        )}

        <button
          className="primary-btn"
          onClick={() => navigate(`/add-fertilizer?farmId=${farm._id}`)}
        >
          ➕ Add Fertilizer
        </button>
      </div>

      {/* EXPENSE SECTION */}
      <div className="card">
        <h3>💰 Expense</h3>

        <div className="button-row">
          <button onClick={() => navigate(`/farm/${farm._id}/expenses`)}>
            View Expenses
          </button>

          <button onClick={() => navigate(`/farm/${farm._id}/add-expense`)}>
            ➕ Add Expense
          </button>

          <button onClick={() => navigate(`/farm/${farm._id}/income`)}>
            View Income
          </button>

          <button
            className="add-income-btn"
            onClick={() => navigate(`/farm/${farmId}/income/add`)}
          >
            + Add Income
          </button>
        </div>
      </div>

      {/* FERTILIZER RECOMMENDATION */}
      <div className="card recommendation-card">
        <h3 className="section-title">📊 Fertilizer Recommendation</h3>

        <div className="rec-form">
          <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
            {farm.crops && farm.crops.length > 0 ? (
              farm.crops.map((c, idx) => {
                const cropName = c.name || c;
                return <option key={idx} value={cropName}>{cropName}</option>;
              })
            ) : (
              <option value={farm.cropName}>{farm.cropName}</option>
            )}
          </select>

          <input
            type="text"
            value={fertilizerName}
            onChange={(e) => setFertilizerName(e.target.value)}
            placeholder="Fertilizer name"
          />

          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">Select Crop Stage</option>
            {availableStages.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
          />

          <input
            type="number"
            placeholder="Farmer Interval (optional)"
            value={farmerInterval}
            onChange={(e) => setFarmerInterval(e.target.value)}
          />
        </div>

        <button
          className="primary-btn full-width"
          onClick={calculateRecommendation}
        >
          {loadingRec ? "Calculating..." : "Calculate Next Fertilizer"}
        </button>

        {recommendation && (
          <div className="recommendation-result">

            <div className="result-row">
              <span>📅 Next Date</span>
              <strong>{recommendation.nextDate}</strong>
            </div>

            <div className="result-row">
              <span>⏱ Final Interval Used</span>
              <strong>{recommendation.usedInterval} days</strong>
            </div>

            <hr style={{ margin: "10px 0", opacity: 0.2 }} />

            <p><strong>📊 Interval Breakdown</strong></p>

            <p>🌾 Crop Stage Interval: {recommendation.cropInterval} days</p>

            <p>🧪 Fertilizer Minimum Interval: {recommendation.fertilizerInterval} days</p>

            <p>🛡 Base Safe Interval: {recommendation.baseInterval} days</p>

            {recommendation.farmerInterval && (
              <p>👨‍🌾 Farmer Requested: {recommendation.farmerInterval} days</p>
            )}

            <p>📌 Decision: {recommendation.message}</p>

            <div className="result-row">
              <span>🌦 Weather</span>
              <strong>{recommendation.weatherStatus}</strong>
            </div>

            <button
              className="primary-btn"
              onClick={applyRecommendation}
              disabled={applying}
            >
              {applying ? "Applying..." : "✅ Apply Recommendation"}
            </button>
          </div>
        )}
      </div>

      {uiMessage && (
        <div className={`alert ${uiType}`}>
          {uiMessage}
        </div>
      )}

      <button
        className="predict-btn"
        onClick={() => navigate(`/farm/${farm._id}/yield`)}
      >
        📈 Predict Yield
      </button>
    </div>
  );
}

export default FarmDetails;
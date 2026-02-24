import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "./FarmDetails.css"

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
  const [lastDate, setLastDate] = useState("");
  const [farmerInterval, setFarmerInterval] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
 //whether
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const [weather, setWeather] = useState(null);

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
  }, [farm, API_KEY]);

  useEffect(() => {
    // Fetch farm details
    fetch(`http://localhost:5000/api/farm/details/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFarm(data.data);
        }
      });

    // Fetch fertilizers
    fetch(`http://localhost:5000/api/fertilizer/farm/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        setFertilizers(data);
      });
  }, [farmId]);

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
            crop: farm.cropName.toLowerCase(),
            stage,
            lastDate: new Date(lastDate).toISOString().split("T")[0],
            farmerInterval: farmerInterval? Number(farmerInterval): undefined,

          }),

        }
      );

      const data = await res.json();
      setRecommendation(data);
    } catch{
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
          appliedDate: new Date(lastDate).toISOString().split("T")[0],
          intervalDays: recommendation.usedInterval,
          quantity: 1,
          unit: "kg",
          cropName: farm.cropName,
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

    // refresh history
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
        <p><strong>Crop:</strong> {farm.cropName}</p>
        <p><strong>Area:</strong> {farm.areaInAcres} acres</p>
        <p><strong>Season:</strong> {farm.season}</p>
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
    <input
      type="text"
      placeholder="Fertilizer name (e.g. Urea)"
      value={fertilizerName}
      onChange={(e) => setFertilizerName(e.target.value)}
    />

    <select
      value={stage}
      onChange={(e) => setStage(e.target.value)}
    >
      <option value="" disabled>Select Crop Stage</option>
      <option value="sowing">Sowing</option>
      <option value="seedling">Seedling</option>
      <option value="vegetative">Vegetative</option>
      <option value="flowering">Flowering</option>
      <option value="fruiting">Fruiting</option>
      <option value="harvest">Harvest</option>
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
        <span>⏱ Interval Used</span>
        <strong>{recommendation.usedInterval} days</strong>
      </div>

      <p className="result-message">
        {recommendation.message}
      </p>

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
{/* UI MESSAGE */}
    {uiMessage && (
      <div className={`alert ${uiType}`}>
        {uiMessage}
      </div>
    )}

  <button
      className="predict-btn"
      onClick={() => navigate(`/farm/${farm._id}/yield`)}
    >
      <span className="btn-icon">📈</span>
      <span>Predict Yield</span>
    </button>



    
  </div>
);
}

export default FarmDetails;

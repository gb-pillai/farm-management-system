import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "./YieldAnalyticsPage.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function YieldAnalyticsPage() {
  const { id } = useParams();

  const [farm, setFarm] = useState({
    cropType: "",
    district: "",
    area: "",
  });

  const [weather, setWeather] = useState(null);
  const [predictedYield, setPredictedYield] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [farmLoading, setFarmLoading] = useState(true);

  // ✅ Load Farm + History
  useEffect(() => {
    const loadData = async () => {
      try {
        const farmRes = await axios.get(
          `http://localhost:5000/api/farm/${id}`
        );

        if (farmRes.data) {
          setFarm({
            cropType: farmRes.data.cropType || "",
            district: farmRes.data.district || "",
            area: farmRes.data.area || "",
          });
        }

        const historyRes = await axios.get(
          `http://localhost:5000/api/yield/farm/${id}`
        );

        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch (err) {
        console.error("Initial load error:", err);
      } finally {
        setFarmLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ✅ Weather API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!farm?.district) return;

        // ✅ Only fetch when district length > 3
        if (farm.district.length < 4) return;

        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${farm.district}&units=metric&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        );

        setWeather({
          temp: res.data.main.temp,
          humidity: res.data.main.humidity,
        });

      } catch (err) {
        // ✅ Silently ignore 404 while typing
        if (err.response?.status !== 404) {
          console.error("Weather fetch error:", err);
        }
      }
    };

  fetchWeather();
}, [farm.district]);

  // ✅ Season must match ML dataset
  const getModelSeason = () => {
    const month = new Date().getMonth() + 1;

    if (month >= 6 && month <= 9) return "Kharif";     // Monsoon
    if (month >= 10 || month <= 3) return "Rabi";     // Winter
    return "Whole Year";                               // April–May fallback
  };

  // ✅ Predict Yield
  const handlePredict = async () => {
    if (!farm.cropType || !farm.district || !farm.area) {
      alert("Please fill Crop, District and Area before predicting.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/yield/predict",
        {
          farmId: id,
          crop: farm.cropType,
          district: farm.district.toUpperCase(),
          season: getModelSeason(),
          area: Number(farm.area),
          year: new Date().getFullYear(),
        }
      );

      setPredictedYield(res.data.predictedYield);

      // Refresh history
      const historyRes = await axios.get(
        `http://localhost:5000/api/yield/farm/${id}`
      );

      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Prediction failed. Check backend or Python script.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: history.map((_, i) => `Prediction ${i + 1}`),
    datasets: [
      {
        label: "Yield (kg)",
        data: history.map((item) => item.predictedYield),
        borderColor: "green",
        backgroundColor: "rgba(0,128,0,0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
  <div className="yield-container">
    <div className="content-wrapper">

      <h2 className="yield-title">Yield Analytics</h2>

      {farmLoading && <p>Loading farm details...</p>}

      {!farmLoading && (
        <div className="card prediction-card">

          <div>
            <label>Crop</label>
            <input
              type="text"
              value={farm.cropType}
              onChange={(e) =>
                setFarm({ ...farm, cropType: e.target.value })
              }
            />
          </div>

          <div>
            <label>District</label>
            <input
              type="text"
              value={farm.district}
              onChange={(e) =>
                setFarm({ ...farm, district: e.target.value })
              }
            />
          </div>

          <div>
            <label>Area (hectares)</label>
            <input
              type="number"
              value={farm.area}
              onChange={(e) =>
                setFarm({ ...farm, area: e.target.value })
              }
            />
          </div>

          {weather && (
            <div className="weather-info">
              <p><strong>Season:</strong> {getModelSeason()}</p>
              <p><strong>Temperature:</strong> {weather.temp}°C</p>
              <p><strong>Humidity:</strong> {weather.humidity}%</p>
            </div>
          )}

        </div>
      )}

      <button onClick={handlePredict} disabled={loading}>
        {loading ? "Predicting..." : "Predict Yield"}
      </button>

      {predictedYield !== null && (
        <div className="card result-card">
          Latest Predicted Yield:{" "}
          {Number(predictedYield).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })} kg
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="chart-section">
            <Line data={chartData} />
          </div>

          <div className="yield-table-container">
            <table className="yield-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Yield (kg)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {Number(item.predictedYield).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  </div>
);
}
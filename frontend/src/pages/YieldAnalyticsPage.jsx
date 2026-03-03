import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./YieldAnalyticsPage.css";

export default function YieldAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState({
    cropType: "",
    district: "",
    area: "",
  });

  const [areaUnit, setAreaUnit] = useState("hectare");
  const [weather, setWeather] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [predictedYield, setPredictedYield] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [farmLoading, setFarmLoading] = useState(true);

  // ---------------------------
  // SEASONAL AVERAGE DATA
  // ---------------------------
  const seasonalAverages = {
    Kharif: { temp: 28, humidity: 90 },
    Rabi: { temp: 25, humidity: 80 },
    Summer: { temp: 32, humidity: 75 },
    Winter: { temp: 24, humidity: 85 },
    Autumn: { temp: 27, humidity: 82 },
    "Whole Year": { temp: 27, humidity: 83 },
  };

  // ---------------------------
  // Convert Area to Hectare
  // ---------------------------
  const convertToHectare = (area, unit) => {
    let value = Number(area);
    if (unit === "acre") return value * 0.404686;
    if (unit === "cent") return value * 0.00404686;
    return value;
  };

  // ---------------------------
  // Get Current Season
  // ---------------------------
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 9) return "Kharif";
    if (month >= 10 || month <= 3) return "Rabi";
    return "Summer";
  };

  // ---------------------------
  // Load Farm + History
  // ---------------------------
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

        setSelectedSeason(getCurrentSeason());

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

  // ---------------------------
  // Fetch Live Weather
  // ---------------------------
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!farm?.district || farm.district.length < 3) return;

        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${farm.district}&units=metric&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        );

        setWeather({
          temp: res.data.main.temp,
          humidity: res.data.main.humidity,
        });
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();
  }, [farm.district]);

  // ---------------------------
  // Handle Prediction
  // ---------------------------
  const handlePredict = async () => {
    if (!farm.cropType || !farm.district || !farm.area) {
      alert("Please fill Crop, District and Area before predicting.");
      return;
    }

    try {
      setLoading(true);

      const areaInHectare = convertToHectare(farm.area, areaUnit);
      const currentSeason = getCurrentSeason();

      let temperature;
      let humidity;

      if (selectedSeason === currentSeason && weather) {
        temperature = weather.temp;
        humidity = weather.humidity;
      } else {
        temperature = seasonalAverages[selectedSeason]?.temp;
        humidity = seasonalAverages[selectedSeason]?.humidity;
      }

      const res = await axios.post(
        "http://localhost:5000/api/yield/predict",
        {
          farmId: id,
          crop: farm.cropType,
          district: farm.district.toUpperCase(),
          season: selectedSeason,
          area: areaInHectare,
          temperature,
          humidity,
          year: new Date().getFullYear(),
        }
      );

      setPredictedYield(res.data.predictedYield);

      const historyRes = await axios.get(
        `http://localhost:5000/api/yield/farm/${id}`
      );

      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Prediction failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="yield-container">
      <div className="content-wrapper">

        <button className="back-btn" onClick={() => navigate(`/farm/${id}`)}>
          ⬅ Back to Farms
        </button>

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
              <select
                value={farm.district}
                onChange={(e) =>
                  setFarm({ ...farm, district: e.target.value })
                }
              >
                <option value="">Select District</option>
                <option value="Kasaragod">Kasaragod</option>
                <option value="Kannur">Kannur</option>
                <option value="Wayanad">Wayanad</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Malappuram">Malappuram</option>
                <option value="Palakkad">Palakkad</option>
                <option value="Thrissur">Thrissur</option>
                <option value="Ernakulam">Ernakulam</option>
                <option value="Idukki">Idukki</option>
                <option value="Kottayam">Kottayam</option>
                <option value="Alappuzha">Alappuzha</option>
                <option value="Pathanamthitta">Pathanamthitta</option>
                <option value="Kollam">Kollam</option>
                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
              </select>
            </div>

            <div>
              <label>Area</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="number"
                  value={farm.area}
                  onChange={(e) =>
                    setFarm({ ...farm, area: e.target.value })
                  }
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                >
                  <option value="hectare">Hectare</option>
                  <option value="acre">Acre</option>
                  <option value="cent">Cent</option>
                </select>
              </div>
            </div>

            <div>
              <label>Season</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                <option value="Autumn">Autumn</option>
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
              </select>
            </div>

            {(weather || seasonalAverages[selectedSeason]) && (
              <div className="weather-info">
                <p><strong>Season:</strong> {selectedSeason}</p>
                <p>
                  <strong>Temperature:</strong>{" "}
                  {selectedSeason === getCurrentSeason() && weather
                    ? weather.temp
                    : seasonalAverages[selectedSeason]?.temp}°C
                </p>
                <p>
                  <strong>Humidity:</strong>{" "}
                  {selectedSeason === getCurrentSeason() && weather
                    ? weather.humidity
                    : seasonalAverages[selectedSeason]?.humidity}%
                </p>
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
          <div className="yield-table-container">
            <h3>Prediction History</h3>
            <table className="yield-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Crop</th>
                  <th>District</th>
                  <th>Area (ha)</th>
                  <th>Season</th>
                  <th>Yield (kg)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{item.cropType}</td>
                    <td>{item.district}</td>
                    <td>{Number(item.area).toFixed(3)}</td>
                    <td>{item.season}</td>
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
        )}

      </div>
    </div>
  );
}
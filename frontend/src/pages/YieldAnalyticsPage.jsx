import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
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

  const [form, setForm] = useState({
    cropType: "",
    area: "",
    rainfall: "",
    temperature: "",
    humidity: "",
    fertilizer: "",
  });

  const [predictedYield, setPredictedYield] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch prediction history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/yield/farm/${id}`
      );
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, [id]);

  // 🔹 Load history when page loads
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Handle prediction submit
  const handleSubmit = async () => {
    if (!form.area || !form.rainfall || !form.temperature) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/yield/predict",
        {
          ...form,
          farmId: id,
          area: Number(form.area),
          rainfall: Number(form.rainfall),
          temperature: Number(form.temperature),
          humidity: Number(form.humidity),
          fertilizer: Number(form.fertilizer),
        }
      );

      setPredictedYield(res.data.predictedYield);
      fetchHistory(); // Refresh history after new prediction
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Chart Data
  const chartData = {
    labels: history.map((item, index) => `Prediction ${index + 1}`),
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
    <div style={{ padding: "30px" }}>
      <h2>Yield Analytics</h2>

      {/* FORM */}
      <div style={{ marginBottom: "20px" }}>
        <input name="cropType" placeholder="Crop Type" onChange={handleChange} />
        <input name="area" placeholder="Area (ha)" onChange={handleChange} />
        <input name="rainfall" placeholder="Rainfall (mm)" onChange={handleChange} />
        <input name="temperature" placeholder="Temperature (°C)" onChange={handleChange} />
        <input name="humidity" placeholder="Humidity (%)" onChange={handleChange} />
        <input name="fertilizer" placeholder="Fertilizer (kg)" onChange={handleChange} />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Predicting..." : "Predict Yield"}
        </button>
      </div>

      {/* RESULT */}
      {predictedYield !== null && (
        <h3>Latest Predicted Yield: {predictedYield} kg</h3>
      )}

      {/* CHART */}
      {history.length > 0 && (
        <div style={{ width: "700px", marginTop: "30px" }}>
          <Line data={chartData} />
        </div>
      )}

      {/* HISTORY TABLE */}
      {history.length > 0 && (
        <table border="1" style={{ marginTop: "30px", width: "500px" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Yield (kg)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>{item.predictedYield}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
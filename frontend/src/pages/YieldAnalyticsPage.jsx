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
    district: "",
    season: "",
    area: "",
    year: "",
  });

  const [predictedYield, setPredictedYield] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/yield/farm/${id}`
      );
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.cropType || !form.area || !form.year) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/yield/predict",
        {
          farmId: id,
          crop: form.cropType,
          district: form.district.toUpperCase(),
          season: form.season,
          area: Number(form.area),
          year: Number(form.year),
        }
      );

      setPredictedYield(res.data.predictedYield);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

      <div style={{ marginBottom: "20px" }}>
        <input name="cropType" placeholder="Crop Type" onChange={handleChange} />
        <input name="area" placeholder="Area (ha)" onChange={handleChange} />
        <input name="year" placeholder="Year (e.g. 2025)" onChange={handleChange} />

        <select name="district" onChange={handleChange}>
          <option value="">Select District</option>
          <option value="KANNUR">KANNUR</option>
          <option value="KOZHIKODE">KOZHIKODE</option>
          <option value="MALAPPURAM">MALAPPURAM</option>
        </select>

        <select name="season" onChange={handleChange}>
          <option value="">Select Season</option>
          <option value="Kharif">Kharif</option>
          <option value="Rabi">Rabi</option>
          <option value="Summer">Summer</option>
        </select>

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Predicting..." : "Predict Yield"}
        </button>
      </div>

      {predictedYield !== null && (
        <h3>Latest Predicted Yield: {predictedYield} kg</h3>
      )}

      {history.length > 0 && (
        <div style={{ width: "700px", marginTop: "30px" }}>
          <Line data={chartData} />
        </div>
      )}

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
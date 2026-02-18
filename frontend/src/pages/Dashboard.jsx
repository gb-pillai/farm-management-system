import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FertilizerStatusChart from "../components/charts/FertilizerStatusChart";
import ProfitPerFarmChart from "../components/charts/ProfitPerFarmChart";
import FarmUsageChart from "../components/charts/FarmUsageChart";
import ExpensePie from "../components/charts/ExpensePie";
import "./Dashboard.css";


function Dashboard() {
  const [farms, setFarms] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [summary, setSummary] = useState({
    totalFarms: 0,
    totalFertilizers: 0,
    overdue: 0,
    dueSoon: 0,
  });
  const [expenseCategoryData, setExpenseCategoryData] = useState([]);
  const [farmUsageData, setFarmUsageData] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      navigate("/");
      return;
    }

    fetch(`http://localhost:5000/api/farm/${userId}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.success) return;

        setFarms(data.data);

        let totalFertilizers = 0;
        let overdue = 0;
        let dueSoon = 0;
        const today = new Date();

        const usageArray = [];

        for (const farm of data.data) {
          const res = await fetch(
            `http://localhost:5000/api/fertilizer/farm/${farm._id}`
          );
          const fertilizers = await res.json();

          totalFertilizers += fertilizers.length;

          // 🔥 This creates data for FarmUsageChart
          usageArray.push({
            farm: farm.farmName,
            count: fertilizers.length,
          });

          fertilizers.forEach((f) => {
            if (!f.nextDueDate) return;
            const due = new Date(f.nextDueDate);

            if (due < today) overdue++;
            else if (due - today <= 3 * 24 * 60 * 60 * 1000) dueSoon++;
          });
        }

        setFarmUsageData(usageArray);

        setSummary({
          totalFarms: data.data.length,
          totalFertilizers,
          overdue,
          dueSoon,
        });
      });

      
  }, [navigate]);

  useEffect(() => {
  if (!farms.length) return;

  // Use the first farm for now
  const farmId = farms[0]._id;

  fetch(`http://localhost:5000/api/analytics/expenses/category/${farmId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setExpenseCategoryData(data.data);
      }
    })
    .catch(err => console.error(err));

}, [farms]);

useEffect(() => {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  fetch(`http://localhost:5000/api/analytics/dashboard/profit/${userId}`)
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        setProfitData(result.data);
      }
    })
    .catch(err => console.error(err));
}, []);

 return (
  <div className="dashboard-container">
    {/* HEADER */}
    <div className="dashboard-header">
      <h1>🌾 Farm Dashboard</h1>
      <p className="subtitle">Overview of your farms, expenses & fertilizers</p>
    </div>

    {/* SUMMARY CARDS */}
    <div className="summary-grid">
      <div className="summary-card">
        <span className="icon">📁</span>
        <div>
          <p className="label">Farms</p>
          <h2>{summary.totalFarms}</h2>
        </div>
      </div>

      <div className="summary-card">
        <span className="icon">🌱</span>
        <div>
          <p className="label">Fertilizers</p>
          <h2>{summary.totalFertilizers}</h2>
        </div>
      </div>

      <div className="summary-card danger">
        <span className="icon">🔴</span>
        <div>
          <p className="label">Overdue</p>
          <h2>{summary.overdue}</h2>
        </div>
      </div>

      <div className="summary-card warning">
        <span className="icon">🟡</span>
        <div>
          <p className="label">Due Soon</p>
          <h2>{summary.dueSoon}</h2>
        </div>
      </div>
    </div>

    {/* ANALYTICS */}
    <section className="analytics-section">
      <h2 className="section-title">📊 Analytics Overview</h2>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Fertilizer Status</h3>
          <FertilizerStatusChart summary={summary} />
        </div>

        <div
          className="chart-card clickable"
          onClick={() => navigate("/expenses")}
        >
          <h3>Expense Breakdown</h3>
          <ExpensePie data={expenseCategoryData} />
          <p className="hint">Click to view detailed expenses</p>
        </div>

        <div className="chart-card">
          <h3>Profit Per Farm</h3>
          <ProfitPerFarmChart data={profitData} />
        </div>

        <div className="chart-card">
          <h3>Fertilizer Usage</h3>
          <FarmUsageChart data={farmUsageData} />
        </div>
      </div>
    </section>

    {/* FARMS */}
    <section className="farms-section">
      <h2 className="section-title">🌾 Your Farms</h2>

      {farms.length === 0 ? (
        <p className="no-data">No farm data available</p>
      ) : (
        <div className="farm-grid">
          {farms.map((farm) => (
            <div
              key={farm._id}
              className="farm-card"
              onClick={() => navigate(`/farm/${farm._id}`)}
            >
              <h4>{farm.farmName}</h4>
              <p>{farm.cropName}</p>
              <span className="view-link">View →</span>
            </div>
          ))}
        </div>
      )}

      <button
        className="primary-btn add-farm-btn"
        onClick={() => navigate("/add-farm")}
      >
        ➕ Add New Farm
      </button>
    </section>
  </div>
);
}

export default Dashboard;

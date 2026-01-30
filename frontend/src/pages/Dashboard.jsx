import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FertilizerStatusChart from "../components/charts/FertilizerStatusChart";
import ProfitPerFarmChart from "../components/charts/ProfitPerFarmChart";
import FarmUsageChart from "../components/charts/FarmUsageChart";
import "./Dashboard.css";





function Dashboard() {
  const [farms, setFarms] = useState([]);
  const [summary, setSummary] = useState({
    totalFarms: 0,
    totalFertilizers: 0,
    overdue: 0,
    dueSoon: 0,
  });

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

        for (const farm of data.data) {
          const res = await fetch(
            `http://localhost:5000/api/fertilizer/farm/${farm._id}`
          );
          const fertilizers = await res.json();

          totalFertilizers += fertilizers.length;

          fertilizers.forEach((f) => {
            if (!f.nextDueDate) return;
            const due = new Date(f.nextDueDate);

            if (due < today) overdue++;
            else if (due - today <= 3 * 24 * 60 * 60 * 1000) dueSoon++;
          });
        }

        setSummary({
          totalFarms: data.data.length,
          totalFertilizers,
          overdue,
          dueSoon,
        });
      });



      
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🌾 Farm Dashboard</h1>

      
      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="summary-card">
          <span className="icon">📁</span>
          <h3>Farms</h3>
          <p>{summary.totalFarms}</p>
        </div>

        <div className="summary-card">
          <span className="icon">🌱</span>
          <h3>Fertilizers</h3>
          <p>{summary.totalFertilizers}</p>
        </div>

        <div className="summary-card overdue">
          <span className="icon">🔴</span>
          <h3>Overdue</h3>
          <p>{summary.overdue}</p>
        </div>

        <div className="summary-card due-soon">
          <span className="icon">🟡</span>
          <h3>Due Soon</h3>
          <p>{summary.dueSoon}</p>
        </div>
      </div>
      
<section className="charts-section">
  <h2 className="charts-title">📊 Analytics Overview</h2>

  <div className="charts-grid">

    <div className="chart-card">
      <h3>Fertilizer Status</h3>
      <FertilizerStatusChart
        data={{ normal: 3, dueSoon: 1, overdue: 0 }}
      />
    </div>

    <div className="chart-card">
      <h3>Profit per Farm</h3>
      <ProfitPerFarmChart
        farms={[
          { farm: "Rice Field", profit: 40000 },
          { farm: "Coconut Farm", profit: 30000 },
        ]}
      />
    </div>

    <div className="chart-card">
      <h3>Fertilizer Usage</h3>
      <FarmUsageChart
        data={[
          { farm: "Rice Field", count: 5 },
          { farm: "Coconut Farm", count: 2 },
        ]}
      />
    </div>

  </div>
</section>
<section className="farms-section">
      {/* FARMS LIST */}
      <h2 className="section-title">Your Farms</h2>

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
            </div>
          ))}
        </div>
      )}

      <button
        className="add-farm-btn"
        onClick={() => navigate("/add-farm")}
      >
        ➕ Add New Farm
      </button>
      </section>
    </div>
  );
  
}


export default Dashboard;

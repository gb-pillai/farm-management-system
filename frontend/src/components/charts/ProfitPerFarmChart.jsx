import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ProfitPerFarmChart({ farms }) {
  if (!farms) return <p>Loading chart...</p>;

  return (
    <div style={{ height: "260px" }}>
    <Bar
      data={{
        labels: farms.map(f => f.farm),
        datasets: [
          {
            label: "Profit (₹)",
            data: farms.map(f => f.profit),
          },
        ],
      }}
      options={{
            responsive: true,
            maintainAspectRatio: false, // 🔑 IMPORTANT
        }}
    />
    </div>
  );
}

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ProfitPerFarmChart({ data }) {
  if (!data || !data.length) return <p>No profit data</p>;

  const profits = data.map(d => Number(d.profit));

  return (
    <div style={{ height: "260px", width: "100%" }}>
      <Bar
        data={{
          labels: data.map(d => d.farmName),
          datasets: [
            {
              label: "Profit (₹)",
              data: profits,
              backgroundColor: profits.map(p =>
                p >= 0 ? "#22c55e" : "#ef4444"
              ),
              borderRadius: 6,
              barThickness: 40,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              labels: {
                color: "#fff",
                font: {
                  size: 13,
                },
              },
            },
            tooltip: {
              backgroundColor: "#1f2937",
              titleColor: "#fff",
              bodyColor: "#fff",
              padding: 10,
            },
          },

          scales: {
            x: {
              ticks: {
                color: "#ccc",
              },
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                color: "#ccc",
              },
              grid: {
                color: "rgba(255,255,255,0.05)",
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}

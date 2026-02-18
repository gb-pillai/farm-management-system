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
    <div style={{ height: "260px" }}>
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
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        }}
      />
    </div>
  );
}

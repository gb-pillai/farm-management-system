import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FarmUsageChart({ data }) {
  if (!data) return <p>Loading chart...</p>;

  return (
    <div style={{ height: "260px" }}>
    <Bar
      data={{
        labels: data.map(d => d.farm),
        datasets: [
          {
            label: "Fertilizer Applications",
            data: data.map(d => d.count),
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        }}

    />
    </div>
  );
  
}

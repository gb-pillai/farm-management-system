import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FertilizerStatusChart({ data }) {
  if (!data) return <p>Loading chart...</p>;

  return (
    <div style={{ height: "260px" }}>
    <Pie
      data={{
        labels: ["Normal", "Due Soon", "Overdue"],
        datasets: [
          {
            data: [data.normal, data.dueSoon, data.overdue],
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

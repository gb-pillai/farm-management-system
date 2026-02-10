import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FertilizerStatusChart({ summary }) {
  if (!summary) return <p>Loading chart...</p>;

  const normal =
    summary.totalFertilizers -
    summary.dueSoon -
    summary.overdue;

  return (
    <div style={{ height: "260px" }}>
      <Pie
        data={{
          labels: ["Normal", "Due Soon", "Overdue"],
          datasets: [
            {
              data: [
                normal < 0 ? 0 : normal,
                summary.dueSoon,
                summary.overdue,
              ],
              backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
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

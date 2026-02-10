import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

function CategoryExpenseBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ opacity: 0.6 }}>No expense data to display</p>;
  }

  return (
    <div
      style={{
        width: "600px",
        height: "300px",
        marginTop: "20px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="category" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Bar
            dataKey="total"
            fill="#22c55e"
            barSize={40}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryExpenseBarChart;

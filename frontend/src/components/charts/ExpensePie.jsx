import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#8884d8"];

export default function ExpensePie({ data = [] }) {
  if (!data.length) {
    return <p>No expense data available</p>;
  }

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="totalAmount"
        nameKey="_id"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

import { useEffect, useState } from "react";

const ExpenseAnalytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    fetch(`http://localhost:5000/api/expenses/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExpenses(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>💸 Expense Analytics</h1>

      <h3 style={{ marginTop: "10px" }}>
        Total Expense: ₹ {totalExpense}
      </h3>

      {loading ? (
        <p>Loading...</p>
      ) : expenses.length === 0 ? (
        <p>No expenses recorded yet</p>
      ) : (
        <table
          style={{
            marginTop: "20px",
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Farm</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td>
                  {new Date(exp.expenseDate).toLocaleDateString()}
                </td>
                <td>{exp.title}</td>
                <td>{exp.category}</td>
                <td>{exp.farmId?.farmName || "N/A"}</td>
                <td>{exp.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseAnalytics;

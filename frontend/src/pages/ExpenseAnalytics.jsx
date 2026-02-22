import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExpenseAnalytics.css";

const ExpenseAnalytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  <div className="expense-container">
    <button
      className="back-btn"
      onClick={() => navigate("/dashboard")}
    >
      ← Back to Dashboard
    </button>

    <div className="expense-header">
      <h1>💸 Expense Analytics</h1>
      <h3 className="total-expense">
        Total Expense: ₹ {totalExpense}
      </h3>
    </div>

    {loading ? (
      <p className="status-text">Loading...</p>
    ) : expenses.length === 0 ? (
      <p className="status-text">No expenses recorded yet</p>
    ) : (
      <div className="table-wrapper">
        <table className="expense-table">
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
                <td className="amount-cell">₹ {exp.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};

export default ExpenseAnalytics;

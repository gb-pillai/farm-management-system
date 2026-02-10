import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FarmExpenseAnalytics = () => {
  const { farmId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/expenses/farm/${farmId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExpenses(data.expenses);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [farmId]);

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
        <button className="back-btn" onClick={() => navigate(`/farm/${farmId}`)}>
        ⬅ Back to Farm
        </button>

      <h1>🌾 Farm Expense Analytics</h1>

      <h3>Total Expense: ₹ {totalExpense}</h3>

      {loading ? (
        <p>Loading...</p>
      ) : expenses.length === 0 ? (
        <p>No expenses recorded for this farm</p>
      ) : (
        <table style={{ marginTop: "20px", width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp._id}>
                <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                <td>{exp.title}</td>
                <td>{exp.category}</td>
                <td>{exp.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FarmExpenseAnalytics;

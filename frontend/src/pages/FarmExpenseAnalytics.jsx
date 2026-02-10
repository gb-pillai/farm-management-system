import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FarmExpenseAnalytics.css"
import CategoryExpenseBarChart from "../components/charts/CategoryExpenseBarChart";

const FarmExpenseAnalytics = () => {
  const { farmId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/expenses/farm/${farmId}`)
      .then(res => res.json())
      .then(data => {
        // ✅ backend now returns ARRAY directly
        setExpenses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [farmId]);


  useEffect(() => {
  fetch(`http://localhost:5000/api/expenses/analytics/category/${farmId}`)
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        const formatted = result.data.map(item => ({
          category: item._id,
          total: item.total,
        }));
        setCategoryData(formatted);
      }
    });
}, [farmId]);

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0),0);

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this expense?")) return;

  await fetch(`http://localhost:5000/api/expenses/${id}`, {
    method: "DELETE",
  });

  setExpenses(prev => prev.filter(e => e._id !== id));
};

  return (
    <div style={{ padding: "20px" }}>
        <button className="back-btn" onClick={() => navigate(`/farm/${farmId}`)}>
        ⬅ Back to Farms
        </button>

      <h1>🌾 Farm Expense Analytics</h1>
      <button
            className="add-expense-btn"
            onClick={() => navigate(`/farm/${farmId}/add-expense`)}
        >
            + Add Expense
        </button>

      <h3>Total Expense: ₹ {totalExpense}</h3>
      <h3>Category-wise Expenses</h3>
      <CategoryExpenseBarChart data={categoryData} />

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp._id}>
                <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                <td>{exp.title}</td>
                <td>{exp.category}</td>
                <td>{exp.amount}</td>
                <td>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/expenses/edit/${exp._id}`)}
                >
                  ✏️
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(exp._id)}
                >
                  🗑
                </button>
              </td>
              </tr>
              
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FarmExpenseAnalytics;

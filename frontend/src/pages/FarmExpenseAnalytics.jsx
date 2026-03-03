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

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

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
        <div>
          {Object.entries(
            expenses.reduce((acc, exp) => {
              const crop = exp.cropName || "Farm Wide";
              if (!acc[crop]) acc[crop] = [];
              acc[crop].push(exp);
              return acc;
            }, {})
          ).sort(([a], [b]) => a.localeCompare(b)).map(([cropName, cropExpenses]) => {
            const cropTotal = cropExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
            return (
              <div key={cropName} style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", borderLeft: "5px solid #4CAF50" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333", display: "flex", justifyContent: "space-between" }}>
                  <span>🌱 {cropName}</span>
                  <span>Total: ₹ {cropTotal}</span>
                </h3>
                <table style={{ width: "100%", background: "white", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Title</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Category</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>Amount (₹)</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cropExpenses.map(exp => (
                      <tr key={exp._id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px" }}>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                        <td style={{ padding: "8px" }}>{exp.title}</td>
                        <td style={{ padding: "8px" }}>{exp.category}</td>
                        <td style={{ padding: "8px", fontWeight: "bold" }}>{exp.amount}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <button
                            className="edit-btn"
                            onClick={() => navigate(`/expenses/edit/${exp._id}`)}
                            title="Edit Expense"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(exp._id)}
                            title="Delete Expense"
                            style={{ marginLeft: "5px" }}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmExpenseAnalytics;

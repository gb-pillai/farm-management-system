import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FarmIncome.css";

function FarmIncome() {
  const { farmId } = useParams();
  const navigate = useNavigate();

  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const incomeRes = await axios.get(
        `http://localhost:5000/api/income/farm/${farmId}`
      );

      const expenseRes = await axios.get(
        `http://localhost:5000/api/expenses/farm/${farmId}`
      );

      setIncome(Array.isArray(incomeRes.data) ? incomeRes.data : []);
      setExpenses(Array.isArray(expenseRes.data) ? expenseRes.data : []);
    } catch (error) {
      console.error("Error fetching income data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData(); // ✅ THIS LINE WAS MISSING
}, [farmId]);

  const totalIncome = income.reduce((sum, i) => sum + Number(i.totalAmount || 0),0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;


 return (
    <div className="income-page">
      <h2>💰 Farm Income Overview</h2>

      {/* SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card income">
          <p>Total Income</p>
          <h3>₹ {totalIncome}</h3>
        </div>

        <div className="summary-card expense">
          <p>Total Expense</p>
          <h3>₹ {totalExpense}</h3>
        </div>

        <div className={`summary-card profit ${profit < 0 ? "loss" : ""}`}>
          <p>Net Profit</p>
          <h3>₹ {profit}</h3>
        </div>
      </div>

      {/* INCOME LIST */}
      <div className="card">
        <h3>📈 Income Records</h3>

        {income.length === 0 ? (
          <p>No income added yet</p>
        ) : (
          income.map((item) => (
            <div key={item._id} className="income-row">
              <div>
                <strong>{item.cropName}</strong>
                <p>{new Date(item.soldDate).toDateString()}</p>
                <span className="amount">₹ {item.totalAmount}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ACTIONS */}
      <div className="action-row">
        <button
          className="primary-btn"
          onClick={() => navigate(`/farm/${farmId}/income/add`)}
        >
          ➕ Add Income
        </button>

        <button
          className="back-btn"
          onClick={() => navigate(`/farm/${farmId}`)}
        >
          ← Back to Farm
        </button>
      </div>
    </div>
  );
}

export default FarmIncome;

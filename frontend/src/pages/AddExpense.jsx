import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AddExpense.css";

const AddExpense = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Fertilizer",
    amount: "",
    expenseDate: "",
    notes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      farmId,
      userId: localStorage.getItem("userId"),
    };

    const res = await fetch("http://localhost:5000/api/expenses/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      navigate(`/farm/${farmId}/expenses`);
    }
  };

  return (
    <div className="add-expense-container">
    <button className="back-btn" onClick={() => navigate(`/farm/${farmId}`)}>
        ⬅ Back to Farm
    </button>

  <h2>➕ Add Expense</h2>

  <form className="add-expense-form" onSubmit={handleSubmit}>
    <input
      name="title"
      placeholder="Expense Title"
      onChange={handleChange}
      required
    />

    <select name="category" onChange={handleChange}>
      <option>Fertilizer</option>
      <option>Labor</option>
      <option>Seeds</option>
      <option>Irrigation</option>
      <option>Machinery</option>
      <option>Other</option>
    </select>

    <input
      type="number"
      name="amount"
      placeholder="Amount (₹)"
      onChange={handleChange}
      required
    />

    <input
      type="date"
      name="expenseDate"
      onChange={handleChange}
      required
    />

    <textarea
      name="notes"
      placeholder="Notes (optional)"
      onChange={handleChange}
    />

    <button type="submit">Save Expense</button>
  </form>
</div>

  );
};

export default AddExpense;

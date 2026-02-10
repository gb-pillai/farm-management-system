import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./AddExpense.css";

const AddExpense = () => {
  const { farmId: routeFarmId, id } = useParams(); // id = expenseId (edit)
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Fertilizer",
    amount: "",
    expenseDate: "",
    notes: "",
    farmId: routeFarmId || "",
  });

  // ✅ FETCH EXPENSE IN EDIT MODE
  useEffect(() => {
    if (isEdit) {
      fetch(`http://localhost:5000/api/expenses/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setForm({
              title: data.expense.title,
              category: data.expense.category,
              amount: data.expense.amount,
              expenseDate: data.expense.expenseDate,
              notes: data.expense.notes || "",
              farmId: data.expense.farmId, // 🔥 IMPORTANT
            });
          }
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ ADD / EDIT SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEdit
      ? `http://localhost:5000/api/expenses/${id}`
      : "http://localhost:5000/api/expenses/add";

    const method = isEdit ? "PUT" : "POST";

    const payload = {
      ...form,
      userId: localStorage.getItem("userId"),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      navigate(`/farm/${form.farmId}/expenses`);
    }
  };

  return (
    <div className="add-expense-container">
      <button
        className="back-btn"
        onClick={() => navigate(`/farm/${form.farmId}/expenses`)}
      >
        ⬅ Back to Farm
      </button>

      <h2>{isEdit ? "✏️ Edit Expense" : "➕ Add Expense"}</h2>

      <form className="add-expense-form" onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Expense Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
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
          value={form.amount}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="expenseDate"
          value={form.expenseDate}
          onChange={handleChange}
          required
        />

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
        />

        <button type="submit">
          {isEdit ? "Update Expense" : "Save Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;

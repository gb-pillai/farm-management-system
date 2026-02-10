import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AddIncome.css";

const AddIncome = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    pricePerUnit: "",
    totalAmount: 0,
    soldDate: "",
    notes: "",
  });

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };

    // auto-calc total
    if (updated.quantity && updated.pricePerUnit) {
      updated.totalAmount =
        Number(updated.quantity) * Number(updated.pricePerUnit);
    }

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      farmId,
      userId: localStorage.getItem("userId"),
    };

    const res = await fetch("http://localhost:5000/api/income/add", {
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
    <div className="add-income-container">
      <button className="back-btn" onClick={() => navigate(`/farm/${farmId}`)}>
        ⬅ Back to Farms
        </button>
      <h2>🌾 Add Harvest Income</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="cropName"
          placeholder="Crop Name (Rice, Pepper, etc)"
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity (kg)"
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="pricePerUnit"
          placeholder="Price per unit (₹)"
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="soldDate"
          onChange={handleChange}
          required
        />

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          onChange={handleChange}
        />

        <p><b>Total:</b> ₹ {form.totalAmount}</p>

        <button type="submit">Save Income</button>
      </form>
    </div>
  );
};

export default AddIncome;

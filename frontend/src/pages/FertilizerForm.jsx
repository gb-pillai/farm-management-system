import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function FertilizerForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const farmId = searchParams.get("farmId");

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    date: "",
    intervalDays: "",
    notes: "",
  });

  // Safety check
  if (!farmId) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Fertilizer Form</h2>
        <p style={{ color: "red" }}>Farm ID not found</p>
      </div>
    );
  }

  // ✅ FIXED SUBMIT HANDLER
  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.quantity ||
      !form.date ||
      !form.intervalDays
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/fertilizer/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fertilizerName: form.name,
            quantity: Number(form.quantity),
            unit: "kg",
            appliedDate: form.date,
            intervalDays: Number(form.intervalDays),
            notes: form.notes,
            farmId: farmId,

            // Phase-1 temporary values
            userId: "000000000000000000000001",
            cropName: "Paddy",
          }),
        }
      );

      const data = await response.json();

      // ❌ Backend rejected request
      if (!response.ok) {
        alert(data.error || "Failed to add fertilizer");
        return;
      }

      // ✅ Success
      alert("Fertilizer added successfully");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Fertilizer Form
      </h2>

      <input
        type="text"
        placeholder="Fertilizer Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
        style={inputStyle}
      />

      <input
        type="number"
        placeholder="Quantity (kg)"
        value={form.quantity}
        onChange={(e) =>
          setForm({ ...form, quantity: e.target.value })
        }
        style={inputStyle}
      />

      <input
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value })
        }
        style={inputStyle}
      />

      <input
        type="number"
        placeholder="Interval (days)"
        value={form.intervalDays}
        onChange={(e) =>
          setForm({
            ...form,
            intervalDays: e.target.value,
          })
        }
        style={inputStyle}
      />

      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) =>
          setForm({ ...form, notes: e.target.value })
        }
        style={{ ...inputStyle, height: "80px" }}
      />

      <button onClick={handleSubmit} style={btnStyle}>
        Save Fertilizer
      </button>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "300px",
  padding: "10px",
  marginBottom: "15px",
  backgroundColor: "white",
  color: "black",
  border: "1px solid gray",
};

const btnStyle = {
  padding: "10px 20px",
  backgroundColor: "green",
  color: "white",
  border: "none",
  cursor: "pointer",
};

export default FertilizerForm;

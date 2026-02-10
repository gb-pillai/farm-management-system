import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./FertilizerForm.css";

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

  if (!farmId) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h2>Add Fertilizer</h2>
          <p className="error-text">Farm ID not found</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.name || !form.quantity || !form.date || !form.intervalDays) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/fertilizer/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fertilizerName: form.name,
            quantity: Number(form.quantity),
            unit: "kg",
            appliedDate: form.date,
            intervalDays: Number(form.intervalDays),
            notes: form.notes,
            farmId,
            userId: "000000000000000000000001",
            cropName: "Paddy",
          }),
        }
      );

      if (!response.ok) {
        alert("Failed to add fertilizer");
        return;
      }

      alert("Fertilizer added successfully");
      navigate(-1);
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back to Farmland
          </button>
        <h2 className="form-title">Add Fertilizer</h2>

        <div className="form-group">
          <label>Fertilizer Name</label>
          <input
            type="text"
            placeholder="Urea"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Quantity (kg)</label>
          <input
            type="number"
            placeholder="25"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Applied Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Interval (days)</label>
          <input
            type="number"
            placeholder="15"
            value={form.intervalDays}
            onChange={(e) =>
              setForm({ ...form, intervalDays: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            placeholder="Optional notes"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />
        </div>

        <button className="primary-btn" onClick={handleSubmit}>
          Save Fertilizer
        </button>
      </div>
    </div>
  );
}

export default FertilizerForm;

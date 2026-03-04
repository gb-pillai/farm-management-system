import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatCropName } from "../utils/areaUtils";
import "./AddIncome.css";

const AddIncome = () => {
  const { farmId: routeFarmId, id } = useParams(); // id = incomeId (edit mode)
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    pricePerUnit: "",
    totalAmount: 0,
    soldDate: "",
    notes: "",
    farmId: routeFarmId || "",
  });

  const [farmCrops, setFarmCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);

  // ✅ FETCH INCOME IN EDIT MODE + FARM CROPS
  useEffect(() => {
    const fetchEditData = async () => {
      if (isEdit) {
        try {
          const res = await fetch(`http://localhost:5000/api/income/${id}`);
          const data = await res.json();
          if (data.success) {
            const inc = data.income;
            setForm({
              cropName: inc.cropName || "",
              quantity: inc.quantity || "",
              pricePerUnit: inc.pricePerUnit || "",
              totalAmount: inc.totalAmount || 0,
              soldDate: inc.soldDate ? inc.soldDate.slice(0, 10) : "",
              notes: inc.notes || "",
              farmId: inc.farmId || "",
            });
            // Fetch crops for edit mode using the income's farmId
            fetchCrops(inc.farmId);
          }
        } catch (err) {
          console.error("Failed to load income for edit:", err);
        }
      } else {
        fetchCrops(routeFarmId);
      }
    };

    const fetchCrops = async (fId) => {
      if (!fId) { setLoadingCrops(false); return; }
      try {
        const res = await fetch(`http://localhost:5000/api/farm/details/${fId}`);
        const data = await res.json();
        if (data.success) {
          const crops = data.data.crops && data.data.crops.length > 0
            ? data.data.crops.map(c => c.name || c)
            : (data.data.cropName ? [data.data.cropName] : []);
          setFarmCrops(crops);
          if (!isEdit && crops.length > 0) {
            setForm(prev => ({ ...prev, cropName: prev.cropName || crops[0] }));
          }
        }
      } catch (err) {
        console.error("Failed to load farm crops:", err);
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchEditData();
  }, [id, isEdit, routeFarmId]);

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
      farmId: form.farmId || routeFarmId,
      userId: localStorage.getItem("userId"),
    };

    const url = isEdit
      ? `http://localhost:5000/api/income/${id}`
      : "http://localhost:5000/api/income/add";

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      navigate(`/farm/${form.farmId || routeFarmId}/income`);
    }
  };

  return (
    <div className="add-income-container">
      <button className="back-btn" onClick={() => navigate(`/farm/${form.farmId || routeFarmId}/income`)}>
        ⬅ Back to Income
      </button>
      <h2>{isEdit ? "✏️ Edit Income" : "🌾 Add Harvest Income"}</h2>

      <form onSubmit={handleSubmit}>
        {!loadingCrops && farmCrops.length > 0 ? (
          <select
            name="cropName"
            value={form.cropName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
          >
            {farmCrops.map((crop) => (
              <option key={crop} value={crop}>{formatCropName(crop)}</option>
            ))}
          </select>
        ) : (
          <input
            name="cropName"
            placeholder="Crop Name (Rice, Pepper, etc)"
            value={form.cropName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        )}

        <input
          type="number"
          name="quantity"
          placeholder="Quantity (kg)"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="pricePerUnit"
          placeholder="Price per unit (₹)"
          value={form.pricePerUnit}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="soldDate"
          value={form.soldDate}
          onChange={handleChange}
          required
        />

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
        />

        <p><b>Total:</b> ₹ {form.totalAmount}</p>

        <button type="submit">{isEdit ? "Update Income" : "Save Income"}</button>
      </form>
    </div>
  );
};

export default AddIncome;

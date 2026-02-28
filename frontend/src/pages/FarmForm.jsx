import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FarmForm.css";

function FarmForm() {
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [crops, setCrops] = useState([{ name: "", season: "", sownDate: "", expectedHarvestDate: "" }]);
  const [areaInAcres, setAreaInAcres] = useState("");
  const [season, setSeason] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [profit, setProfit] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setMessage("User not logged in");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/farm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          farmName,
          location,
          crops,
          areaInAcres,
          season,
          yieldAmount,
          profit
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Farm added successfully");
        setFarmName("");
        setLocation("");
        setCrops([{ name: "", season: "", sownDate: "", expectedHarvestDate: "" }]);
        setAreaInAcres("");
        setSeason("");
        setYieldAmount("");
        setProfit("");
      } else {
        setMessage(data.message || "Failed to add farm");
      }
    } catch {
      setMessage("Server error");
    }
  };

  return (
    <div className="farm-form-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>

      <h2>🌾 Add Farm Details</h2>

      <form className="farm-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Farm Name (e.g. My Paddy Field)"
          value={farmName}
          onChange={(e) => setFarmName(e.target.value)}
          required
        />

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        >
          <option value="">Select District</option>
          <option value="Thiruvananthapuram">Thiruvananthapuram</option>
          <option value="Kollam">Kollam</option>
          <option value="Pathanamthitta">Pathanamthitta</option>
          <option value="Alappuzha">Alappuzha</option>
          <option value="Kottayam">Kottayam</option>
          <option value="Idukki">Idukki</option>
          <option value="Ernakulam">Ernakulam</option>
          <option value="Thrissur">Thrissur</option>
          <option value="Palakkad">Palakkad</option>
          <option value="Malappuram">Malappuram</option>
          <option value="Kozhikode">Kozhikode</option>
          <option value="Wayanad">Wayanad</option>
          <option value="Kannur">Kannur</option>
          <option value="Kasaragod">Kasaragod</option>
        </select>

        {crops.map((crop, index) => (
          <div key={index} className="crop-input-group" style={{
            display: "flex", flexDirection: "column", gap: "10px",
            marginBottom: "15px", padding: "15px", border: "1px solid #ddd",
            borderRadius: "8px", backgroundColor: "#f9f9f9"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4>Crop {index + 1}</h4>
              {crops.length > 1 && (
                <button
                  type="button"
                  className="remove-crop-btn"
                  onClick={() => {
                    const newCrops = crops.filter((_, i) => i !== index);
                    setCrops(newCrops);
                  }}
                  style={{ padding: "5px 10px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  ✖ Remove
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder={`Crop Name (e.g. Paddy)`}
              value={crop.name}
              onChange={(e) => {
                const newCrops = [...crops];
                newCrops[index].name = e.target.value;
                setCrops(newCrops);
              }}
              required
              style={{ marginBottom: 0 }}
            />

            <select
              value={crop.season}
              onChange={(e) => {
                const newCrops = [...crops];
                newCrops[index].season = e.target.value;
                setCrops(newCrops);
              }}
              required
              style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Select Season for this Crop</option>
              <option value="Monsoon">Monsoon</option>
              <option value="Post-Monsoon">Post-Monsoon</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Perennial">Perennial (All-Year)</option>
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.85rem", color: "#555" }}>Sown Date</label>
                <input
                  type="date"
                  value={crop.sownDate}
                  onChange={(e) => {
                    const newCrops = [...crops];
                    newCrops[index].sownDate = e.target.value;
                    setCrops(newCrops);
                  }}
                  required
                  style={{ width: "100%", marginBottom: 0 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.85rem", color: "#555" }}>Expected Harvest</label>
                <input
                  type="date"
                  value={crop.expectedHarvestDate}
                  onChange={(e) => {
                    const newCrops = [...crops];
                    newCrops[index].expectedHarvestDate = e.target.value;
                    setCrops(newCrops);
                  }}
                  required
                  style={{ width: "100%", marginBottom: 0 }}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="add-crop-btn"
          onClick={() => setCrops([...crops, { name: "", season: "", sownDate: "", expectedHarvestDate: "" }])}
          style={{ marginBottom: "15px", padding: "8px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}
        >
          ➕ Add Another Crop
        </button>

        <input
          type="number"
          placeholder="Area in Acres"
          value={areaInAcres}
          onChange={(e) => setAreaInAcres(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Season (Monsoon / Summer)"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Yield Amount (kg)"
          value={yieldAmount}
          onChange={(e) => setYieldAmount(e.target.value)}
        />

        <input
          type="number"
          placeholder="Profit (₹)"
          value={profit}
          onChange={(e) => setProfit(e.target.value)}
        />

        <button type="submit">Add Farm</button>
      </form>

      {message && (
        <p
          className={`form-message ${message.toLowerCase().includes("success")
            ? "success"
            : "error"
            }`}
        >
          {message}
        </p>
      )}
    </div>
  );

}

export default FarmForm;

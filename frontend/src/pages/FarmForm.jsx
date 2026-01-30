import { useState } from "react";

function FarmForm() {
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [cropName, setCropName] = useState("");
  const [areaInAcres, setAreaInAcres] = useState("");
  const [season, setSeason] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [profit, setProfit] = useState("");
  const [message, setMessage] = useState("");

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
          cropName,
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
        setCropName("");
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
    <div style={{ padding: "20px" }}>
      <h2>Add Farm Details</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Farm Name (e.g. My Paddy Field)"
          value={farmName}
          onChange={(e) => setFarmName(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="text"
          placeholder="Location (e.g. Kannur)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="text"
          placeholder="Crop Name (e.g. Paddy)"
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="number"
          placeholder="Area in Acres"
          value={areaInAcres}
          onChange={(e) => setAreaInAcres(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="text"
          placeholder="Season (Monsoon / Summer)"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="number"
          placeholder="Yield Amount (kg)"
          value={yieldAmount}
          onChange={(e) => setYieldAmount(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          placeholder="Profit (₹)"
          value={profit}
          onChange={(e) => setProfit(e.target.value)}
        />

        <br /><br />

        <button type="submit">Add Farm</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default FarmForm;

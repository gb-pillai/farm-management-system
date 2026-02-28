import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FarmForm.css";

function FarmEditForm() {
    const { farmId } = useParams();
    const navigate = useNavigate();

    const [farmName, setFarmName] = useState("");
    const [location, setLocation] = useState("");
    const [areaInAcres, setAreaInAcres] = useState("");
    const [season, setSeason] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // New crop state
    const [newCrop, setNewCrop] = useState({ name: "", season: "", sownDate: "", expectedHarvestDate: "", allocatedArea: "" });
    const [cropMessage, setCropMessage] = useState("");
    const [farmData, setFarmData] = useState(null); // to compute available area

    useEffect(() => {
        fetch(`http://localhost:5000/api/farm/details/${farmId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const farm = data.data;
                    setFarmName(farm.farmName);
                    setLocation(farm.location);
                    setAreaInAcres(farm.areaInAcres);
                    setSeason(farm.season);
                    setFarmData(farm);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [farmId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/farm/${farmId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ farmName, location, areaInAcres, season }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage("Farm updated successfully ✅");
                setTimeout(() => navigate(`/farm/${farmId}`), 1000);
            } else {
                setMessage(data.message || "Failed to update farm");
            }
        } catch {
            setMessage("Server error");
        }
    };

    const handleAddCrop = async (e) => {
        e.preventDefault();
        if (!newCrop.name || !newCrop.season) {
            setCropMessage("Crop name and season are required");
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/farm/${farmId}/crop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCrop),
            });
            const data = await res.json();
            if (data.success) {
                setCropMessage("✅ Crop added successfully!");
                setNewCrop({ name: "", season: "", sownDate: "", expectedHarvestDate: "" });
            } else {
                setCropMessage(data.message || "Failed to add crop");
            }
        } catch {
            setCropMessage("Server error");
        }
    };

    if (loading) return <p style={{ padding: "20px" }}>Loading farm details...</p>;

    return (
        <div className="farm-form-container">
            <button className="back-btn" onClick={() => navigate(`/farm/${farmId}`)}>
                ⬅ Back to Farm
            </button>

            <h2>✏️ Edit Farm Details</h2>

            <form className="farm-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Farm Name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                />

                <select value={location} onChange={(e) => setLocation(e.target.value)} required>
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

                <input
                    type="number"
                    placeholder="Area in Acres"
                    value={areaInAcres}
                    onChange={(e) => setAreaInAcres(e.target.value)}
                    required
                />

                <select value={season} onChange={(e) => setSeason(e.target.value)} required>
                    <option value="">Select Primary Season</option>
                    <option value="Monsoon">Monsoon</option>
                    <option value="Post-Monsoon">Post-Monsoon</option>
                    <option value="Summer">Summer</option>
                </select>

                <button type="submit">💾 Save Changes</button>
            </form>

            {message && (
                <p className={`form-message ${message.toLowerCase().includes("success") ? "success" : "error"}`}>
                    {message}
                </p>
            )}

            {/* ===== ADD NEW CROP SECTION ===== */}
            <hr style={{ margin: "30px 0", borderColor: "#333" }} />
            <h2>🌱 Add New Crop to This Farm</h2>

            {/* Live land availability badge — recalculates based on selected dates */}
            {farmData && (() => {
                const newStart = newCrop.sownDate ? new Date(newCrop.sownDate) : null;
                const newEnd = newCrop.expectedHarvestDate ? new Date(newCrop.expectedHarvestDate) : null;

                const usedArea = (farmData.crops || []).reduce((sum, c) => {
                    if (!c.allocatedArea) return sum;
                    const exStart = c.sownDate ? new Date(c.sownDate) : null;
                    const exEnd = c.expectedHarvestDate ? new Date(c.expectedHarvestDate) : null;

                    // If dates are missing on either side, assume overlap (safe default)
                    if (!newStart || !newEnd || !exStart || !exEnd) return sum + c.allocatedArea;

                    // Overlap: newStart <= exEnd AND newEnd >= exStart
                    const overlaps = newStart <= exEnd && newEnd >= exStart;
                    return overlaps ? sum + c.allocatedArea : sum;
                }, 0);
                const available = Math.max(0, (farmData.areaInAcres || 0) - usedArea);
                const color = available === 0 ? "#e53935" : available < 1 ? "#ff9800" : "#4CAF50";
                const dateLabel = newStart && newEnd
                    ? `during ${newStart.toLocaleDateString()} – ${newEnd.toLocaleDateString()}`
                    : "(select crop dates to see time-specific availability)";
                return (
                    <div style={{ padding: "10px 14px", backgroundColor: "#1b2a1b", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem", color: "#eee" }}>
                        🗺️ <strong>Farm Area:</strong> {farmData.areaInAcres} acres &nbsp;|&nbsp;
                        <strong style={{ color: "#aaa" }}>In Use: {usedArea.toFixed(2)} ac</strong> &nbsp;|&nbsp;
                        <strong style={{ color }}>Available: {available.toFixed(2)} ac</strong>
                        <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "4px" }}>📅 {dateLabel}</div>
                        {available === 0 && newStart && newEnd && <span style={{ color: "#e53935" }}>⚠️ No land free during this period!</span>}
                    </div>
                );
            })()}

            <form className="farm-form" onSubmit={handleAddCrop}>
                <input
                    type="text"
                    placeholder="Crop Name (e.g. Coconut)"
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                    required
                />

                <select
                    value={newCrop.season}
                    onChange={(e) => setNewCrop({ ...newCrop, season: e.target.value })}
                    required
                >
                    <option value="">Select Season for this Crop</option>
                    <option value="Monsoon">Monsoon</option>
                    <option value="Post-Monsoon">Post-Monsoon</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Perennial">Perennial (All-Year)</option>
                </select>

                <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.85rem", color: "#aaa", display: "block", marginBottom: "4px" }}>Sown Date</label>
                        <input
                            type="date"
                            value={newCrop.sownDate}
                            onChange={(e) => setNewCrop({ ...newCrop, sownDate: e.target.value })}
                            style={{ width: "100%", marginBottom: 0 }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.85rem", color: "#aaa", display: "block", marginBottom: "4px" }}>Expected Harvest</label>
                        <input
                            type="date"
                            value={newCrop.expectedHarvestDate}
                            onChange={(e) => setNewCrop({ ...newCrop, expectedHarvestDate: e.target.value })}
                            style={{ width: "100%", marginBottom: 0 }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: "0.85rem", color: "#aaa", display: "block", marginBottom: "4px" }}>Allocated Area (acres)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="How many acres does this crop need?"
                        value={newCrop.allocatedArea}
                        onChange={(e) => setNewCrop({ ...newCrop, allocatedArea: e.target.value })}
                    />
                </div>

                <button type="submit">➕ Add Crop</button>
            </form>

            {cropMessage && (
                <p className={`form-message ${cropMessage.includes("✅") ? "success" : "error"}`}>
                    {cropMessage}
                </p>
            )}
        </div>
    );
}

export default FarmEditForm;

import { useEffect, useState } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import { useParams, useNavigate } from "react-router-dom";
import { getPreferredUnit, acresToDisplay, shortLabel } from "../utils/areaUtils";
import UnitSelector from "../components/UnitSelector";

import "./FarmDetails.css";

// =========================================================
// Auto-detect crop status based on today's date vs dates
// =========================================================
function getEffectiveStatus(crop) {
  if (crop.status === "Harvested" || crop.status === "Removed") return { status: crop.status, auto: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sown = crop.sownDate ? new Date(crop.sownDate) : null;
  const harvest = crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate) : null;
  const removal = crop.removalDate ? new Date(crop.removalDate) : null;

  if (removal && today >= removal) return { status: "Removed", auto: true };
  if (harvest && today > harvest) return { status: "Harvested", auto: true };
  if (sown && today < sown) return { status: "Planned", auto: true };
  if (sown && harvest && today >= sown && today <= harvest) return { status: "Growing", auto: true };
  if (sown && !harvest && today >= sown) return { status: "Growing", auto: true };

  // Fall back to manually set status
  return { status: crop.status || "Growing", auto: false };
}

function FarmDetails() {
  const { farmId } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [fertilizers, setFertilizers] = useState([]);

  // 🔹 Inline Crop Edit State
  const [editingCropId, setEditingCropId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [unit, setUnit] = useState(getPreferredUnit());

  // 🔹 Analytics State
  const [cropAnalytics, setCropAnalytics] = useState([]);
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());

  // ================= FETCH FARM & ANALYTICS =================
  useEffect(() => {
    fetch(`http://localhost:5000/api/farm/details/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFarm(data.data);
        }
      })
      .catch((err) => console.error(err));

    fetch(`http://localhost:5000/api/analytics/farm/${farmId}/annual-crop?year=${analyticsYear}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCropAnalytics(Array.isArray(data.data) ? data.data : []);
        } else {
          setCropAnalytics([]);
        }
      })
      .catch((err) => console.error("Error fetching crop analytics", err));

    fetch(`http://localhost:5000/api/fertilizer/farm/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        setFertilizers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching fertilizers", err);
        setFertilizers([]);
      });
  }, [farmId, analyticsYear]);



  if (!farm) return <p>Loading farm details...</p>;

  return (
    <div className="farm-details-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>

      {/* FARM HEADER */}
      <div className="farm-header card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{farm.farmName}</h2>
          <button
            onClick={() => navigate(`/farm/${farm._id}/edit`)}
            style={{ padding: "6px 14px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            ✏️ Edit Farm
          </button>
        </div>
        <div className="farm-meta">
          <p><strong>Location:</strong> {farm.location}</p>
          <p><strong>Area:</strong> {acresToDisplay(farm.areaInAcres, unit).toFixed(2)} {shortLabel(unit)}</p>
          <p><strong>📅 Season:</strong> {(() => {
            const m = new Date().getMonth();
            if (m >= 5 && m <= 8) return "☔ Monsoon (Jun–Sep)";
            if (m >= 9 && m <= 10) return "🍂 Post-Monsoon (Oct–Nov)";
            if (m >= 11 || m <= 1) return "❄️ Winter (Dec–Feb)";
            return "☀️ Summer (Mar–May)";
          })()}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
          <h4 style={{ margin: 0 }}>Active Crops</h4>
          <UnitSelector onChange={(u) => setUnit(u)} style={{ backgroundColor: "#f0f4f0", color: "#333", border: "1px solid #ccc" }} />
        </div>

        {/* ====== LAND USAGE BAR ====== */}
        {(() => {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const usedArea = (farm.crops || []).reduce((sum, c) => {
            if (!c.allocatedArea) return sum;
            if (c.status === "Harvested" || c.status === "Removed") return sum;

            const sown = c.sownDate ? new Date(c.sownDate) : null;
            const harvest = c.expectedHarvestDate ? new Date(c.expectedHarvestDate) : null;
            const removal = c.removalDate ? new Date(c.removalDate) : null;

            if (removal && today >= removal) return sum;

            // Only count as "currently using land" if today is within the crop's active period
            if (sown && harvest) {
              const isActive = today >= sown && today <= harvest;
              return isActive ? sum + c.allocatedArea : sum;
            }
            if (sown && !harvest) {
              const isActive = today >= sown;
              return isActive ? sum + c.allocatedArea : sum;
            }
            // If dates missing, count it (safe fallback)
            return sum + c.allocatedArea;
          }, 0);
          const total = farm.areaInAcres || 0;
          const available = Math.max(0, total - usedArea);
          const usedCapped = Math.min(usedArea, total); // don't show more than 100%
          const usedPct = total > 0 ? Math.min(100, (usedCapped / total) * 100) : 0;
          const barColor = usedPct >= 90 ? "#e53935" : usedPct >= 70 ? "#ff9800" : "#4CAF50";
          return (
            <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#f0f4f0", borderRadius: "8px", color: "#333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                <span><strong>🗺️ Land Usage (Today)</strong></span>
                <span style={{ color: available === 0 ? "#e53935" : "#333" }}>
                  <strong style={{ color: "#4CAF50" }}>{acresToDisplay(usedArea, unit).toFixed(2)} used</strong> / {acresToDisplay(total, unit).toFixed(2)} {shortLabel(unit)} &nbsp;|&nbsp;
                  <strong style={{ color: available === 0 ? "#e53935" : "#1976d2" }}>{acresToDisplay(available, unit).toFixed(2)} available</strong>
                </span>
              </div>
              <div style={{ height: "10px", backgroundColor: "#ddd", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${usedPct}%`, backgroundColor: barColor, borderRadius: "5px", transition: "width 0.5s ease" }} />
              </div>
              {available === 0 && <p style={{ color: "#e53935", fontSize: "0.82rem", marginTop: "6px" }}>⚠️ No land available right now — harvest a crop first or add a crop for a future period.</p>}
            </div>
          );
        })()}

        <div style={{ display: "grid", gap: "10px" }}>
          {farm.crops && farm.crops.length > 0 ? farm.crops.map((crop, idx) => (
            <div key={crop._id || idx} style={{ padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px", borderLeft: "4px solid #4CAF50", color: "#333" }}>

              {editingCropId === (crop._id || idx) ? (
                // ===== INLINE EDIT FORM =====
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Crop name" style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", color: "#333" }} />
                  <select value={editForm.season} onChange={e => setEditForm({ ...editForm, season: e.target.value })} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", color: "#333" }}>
                    <option value="Monsoon">Monsoon</option>
                    <option value="Post-Monsoon">Post-Monsoon</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Perennial">Perennial (All-Year)</option>
                  </select>
                  <label style={{ fontSize: "0.8rem", color: "#555", marginBottom: "-4px" }}>Sown Date</label>
                  <input type="date" value={editForm.sownDate ? editForm.sownDate.substring(0, 10) : ""} onChange={e => setEditForm({ ...editForm, sownDate: e.target.value })} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
                  {editForm.season !== "Perennial" && (
                    <>
                      <label style={{ fontSize: "0.8rem", color: "#555", marginBottom: "-4px" }}>Expected Harvest</label>
                      <input type="date" value={editForm.expectedHarvestDate ? editForm.expectedHarvestDate.substring(0, 10) : ""} onChange={e => setEditForm({ ...editForm, expectedHarvestDate: e.target.value })} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </>
                  )}
                  <label style={{ fontSize: "0.8rem", color: "#555", marginBottom: "-4px" }}>Allocated Area ({shortLabel(unit)})</label>
                  <input type="number" min="0" step="0.1" value={editForm.allocatedArea || ""} onChange={e => setEditForm({ ...editForm, allocatedArea: e.target.value })} placeholder={`e.g. 1.5 ${shortLabel(unit)}`} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", color: "#333" }} />
                  <select value={editForm.status} onChange={e => {
                    const newStatus = e.target.value;
                    if (newStatus !== "Harvested" && newStatus !== "Removed") {
                      setEditForm({ ...editForm, status: newStatus, removalDate: "" });
                    } else {
                      setEditForm({ ...editForm, status: newStatus, removalDate: editForm.removalDate || new Date().toISOString().substring(0, 10) });
                    }
                  }} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", color: "#333" }}>
                    <option value="Growing">Growing</option>
                    <option value="Planned">Planned</option>
                    {editForm.season === "Perennial" ? (
                      <option value="Removed">Removed</option>
                    ) : (
                      <>
                        <option value="Harvested">Harvested</option>
                        <option value="Removed">Removed (Crop Failed/Destroyed)</option>
                      </>
                    )}
                  </select>
                  {(editForm.status === "Harvested" || editForm.status === "Removed") && (
                    <>
                      <label style={{ fontSize: "0.8rem", color: "#555", marginBottom: "-4px" }}>
                        {editForm.status === "Removed" ? "Date Removed" : "Date Harvested (Actual)"}
                      </label>
                      <input type="date" value={editForm.removalDate ? editForm.removalDate.substring(0, 10) : ""} onChange={e => setEditForm({ ...editForm, removalDate: e.target.value })} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </>
                  )}
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:5000/api/farm/${farm._id}/crop/${crop._id}`, {
                          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm)
                        });
                        const data = await res.json();
                        if (data.success) {
                          setFarm(data.data);
                          setEditingCropId(null);
                        } else {
                          alert(data.message || "Failed to save crop.");
                        }
                      } catch (error) {
                        alert("An error occurred while saving the crop.");
                      }
                    }} style={{ padding: "6px 14px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>💾 Save</button>
                    <button onClick={() => setEditingCropId(null)} style={{ padding: "6px 14px", backgroundColor: "#888", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                // ===== VIEW MODE =====
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#222" }}>{crop.name || crop}</strong>
                      {crop.season && <span style={{ marginLeft: "10px", fontSize: "0.85rem", color: "#666" }}>({crop.season})</span>}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => navigate(`/farm/${farm._id}/add-expense?crop=${encodeURIComponent(crop.name)}`)}
                        style={{ padding: "3px 10px", backgroundColor: "#ff9800", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", marginRight: "10px" }} title="Add Expense for this Crop">➕ Expense</button>
                      <button onClick={() => { setEditingCropId(crop._id || idx); setEditForm({ name: crop.name || "", season: crop.season || "", sownDate: crop.sownDate || "", expectedHarvestDate: crop.expectedHarvestDate || "", status: crop.status || "Growing", allocatedArea: crop.allocatedArea || "", removalDate: crop.removalDate || "" }); }}
                        style={{ padding: "3px 10px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>✏️</button>
                      <button onClick={async () => {
                        if (!window.confirm(`Remove "${crop.name}" from this farm?`)) return;
                        const res = await fetch(`http://localhost:5000/api/farm/${farm._id}/crop/${crop._id}`, { method: "DELETE" });
                        const data = await res.json();
                        if (data.success) setFarm(data.data);
                      }} style={{ padding: "3px 10px", backgroundColor: "#e53935", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ marginTop: "5px", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", color: "#444" }}>
                    <span style={{ color: "#444" }}>🌱 Sown: {crop.sownDate ? new Date(crop.sownDate).toLocaleDateString() : 'N/A'}</span>
                    <span style={{ color: "#444" }}>{crop.season === "Perennial" ? "🌴 Crop: Perennial" : `🌾 Harvest: ${crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString() : 'N/A'}`}</span>
                    {crop.allocatedArea > 0 && <span style={{ color: "#555" }}>🗺️ {acresToDisplay(crop.allocatedArea, unit).toFixed(2)} {shortLabel(unit)}</span>}
                    {(() => {
                      const { status, auto } = getEffectiveStatus(crop);
                      const color = status === "Harvested" ? "#ff9800" : status === "Planned" ? "#2196f3" : status === "Removed" ? "#9e9e9e" : "#4CAF50";
                      return (
                        <span style={{ fontWeight: "bold", color }} title={auto ? "Auto-detected from dates" : "Manually set"}>
                          Status: {status} {auto ? "🔄" : ""}
                        </span>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          )) : <p>{farm.cropName}</p>}
        </div>
      </div>

      {/* FERTILIZER HISTORY */}
      <div className="card">
        <h3>🌱 Fertilizer History</h3>

        {fertilizers.length === 0 ? (
          <p className="empty-text">No fertilizer records found</p>
        ) : (
          fertilizers.map((f) => {
            const today = new Date();
            let status = "normal";

            if (!f.nextDueDate) status = "no-date";
            else {
              const dueDate = new Date(f.nextDueDate);
              if (dueDate < today) status = "overdue";
              else if (dueDate - today <= 3 * 24 * 60 * 60 * 1000)
                status = "due-soon";
            }

            return (
              <div key={f._id} className="fertilizer-card">
                <div className="fert-header">
                  <span className="fert-name">
                    {f.fertilizerName} – {f.quantity} {f.unit}
                  </span>
                  <span className={`status-badge ${status}`}>
                    {status === "overdue" && "🔴 Overdue"}
                    {status === "due-soon" && "🟡 Due Soon"}
                    {status === "normal" && "🟢 Normal"}
                    {status === "no-date" && "⚠️ No Schedule"}
                  </span>
                </div>

                <p>📅 Applied: {new Date(f.appliedDate).toDateString()}</p>

                {f.nextDueDate && (
                  <p>📅 Next Due: {new Date(f.nextDueDate).toDateString()}</p>
                )}

                {f.notes && <p className="notes">📝 {f.notes}</p>}
              </div>
            );
          })
        )}

        <button
          className="primary-btn"
          onClick={() => navigate(`/add-fertilizer?farmId=${farm._id}`)}
        >
          ➕ Add Fertilizer
        </button>
      </div>

      {/* EXPENSE & INCOME SECTION */}
      <div className="card analytics-card">
        <h3>💰 Financials</h3>
        <p>Manage expenses and income records for this farm.</p>
        <div className="btn-group">
          <button onClick={() => navigate(`/farm/${farm._id}/expenses`)}>
            View Expenses
          </button>
          <button onClick={() => navigate(`/farm/${farm._id}/add-expense`)}>
            ➕ Add Expense
          </button>
          <button onClick={() => navigate(`/farm/${farm._id}/income`)}>
            View Income
          </button>
          <button className="add-income-btn" onClick={() => navigate(`/farm/${farmId}/income/add`)}>
            + Add Income
          </button>
        </div>
      </div>

      {/* ANNUAL CROP ANALYTICS SECTION */}
      <div className="card crop-analytics-card" style={{ marginTop: "20px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>📊 Annual Crop Profitability ({analyticsYear})</h3>
          <select
            value={analyticsYear}
            onChange={(e) => setAnalyticsYear(Number(e.target.value))}
            style={{ padding: "5px", borderRadius: "4px" }}
          >
            {[0, 1, 2, 3, 4].map(offset => {
              const year = new Date().getFullYear() - offset;
              return <option key={year} value={year}>{year}</option>
            })}
          </select>
        </div>

        {cropAnalytics.length === 0 ? (
          <p style={{ color: "#aaa" }}>No income or expenses recorded for this year.</p>
        ) : (
          <table style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #444", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Crop / Category</th>
                <th style={{ padding: "10px", color: "#4CAF50" }}>Income (₹)</th>
                <th style={{ padding: "10px", color: "#e53935" }}>Expense (₹)</th>
                <th style={{ padding: "10px" }}>Net Profit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cropAnalytics.map((stat, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #333" }}>
                  <td style={{ padding: "10px" }}><strong>{stat.cropName}</strong></td>
                  <td style={{ padding: "10px", color: "#4CAF50" }}>{stat.income}</td>
                  <td style={{ padding: "10px", color: "#e53935" }}>{stat.expense}</td>
                  <td style={{ padding: "10px", color: stat.profit >= 0 ? "#4CAF50" : "#e53935", fontWeight: "bold" }}>
                    {stat.profit >= 0 ? "+" : ""}{stat.profit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        className="predict-btn"
        style={{ marginTop: "20px" }}
        onClick={() => navigate(`/farm/${farm._id}/yield`)}
      >
        📈 Predict Yield
      </button>

    </div>
  );
}

export default function FarmDetailsWrapper(props) {
  return (
    <ErrorBoundary>
      <FarmDetails {...props} />
    </ErrorBoundary>
  );
}
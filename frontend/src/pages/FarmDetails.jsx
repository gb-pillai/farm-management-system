import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


function FarmDetails() {
  const [uiMessage, setUiMessage] = useState("");
  const [uiType, setUiType] = useState("");
  const [applying, setApplying] = useState(false);
  const userId = localStorage.getItem("userId");

  const { farmId } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [fertilizers, setFertilizers] = useState([]);
  const [fertilizerName, setFertilizerName] = useState("Urea");


  // 🔹 Recommendation states
  const [stage, setStage] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [farmerInterval, setFarmerInterval] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    // Fetch farm details
    fetch(`http://localhost:5000/api/farm/details/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFarm(data.data);
        }
      });

    // Fetch fertilizers
    fetch(`http://localhost:5000/api/fertilizer/farm/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        setFertilizers(data);
      });
  }, [farmId]);

  const calculateRecommendation = async () => {
    if (!stage || !lastDate) {
      alert("Please enter stage and last fertilizer date");
      return;
    }

    setLoadingRec(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/recommendation/next-date",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop: farm.cropName.toLowerCase(),
            stage,
            lastDate: new Date(lastDate).toISOString().split("T")[0],
            farmerInterval: farmerInterval? Number(farmerInterval): undefined,

          }),

        }
      );

      const data = await res.json();
      setRecommendation(data);
    } catch{
      alert("Failed to calculate recommendation");
    }

    setLoadingRec(false);
  };

const applyRecommendation = async () => {
  setApplying(true);
  setUiMessage("");

  try {

    const res = await fetch(
      "http://localhost:5000/api/fertilizer/add",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          farmId: farm._id,
          fertilizerName,
          appliedDate: new Date(lastDate).toISOString().split("T")[0],
          intervalDays: recommendation.usedInterval,
          quantity: 1,
          unit: "kg",
          cropName: farm.cropName,
          notes: recommendation.message,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setUiType("error");
      setUiMessage(data.error || "Failed to apply recommendation");
      setApplying(false);
      return;
    }

    setUiType("success");
    setUiMessage("✅ Recommendation applied successfully");

    // refresh history
    const historyRes = await fetch(
      `http://localhost:5000/api/fertilizer/farm/${farmId}`
    );
    const historyData = await historyRes.json();
    setFertilizers(historyData);

    setRecommendation(null);
  } catch {
    setUiType("error");
    setUiMessage("❌ Server error while applying recommendation");
  }

  setApplying(false);
};




  if (!farm) return <p>Loading farm details...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{farm.farmName}</h2>

      <p><strong>Location:</strong> {farm.location}</p>
      <p><strong>Crop:</strong> {farm.cropName}</p>
      <p><strong>Area:</strong> {farm.areaInAcres} acres</p>
      <p><strong>Season:</strong> {farm.season}</p>

      <hr />

      <h3>🌱 Fertilizer History</h3>

      {fertilizers.length === 0 ? (
        <p>No fertilizer records found</p>
      ) : (
        fertilizers.map((f) => {
          const today = new Date();
          let status = "normal";

          if (!f.nextDueDate) {
            status = "no-date";
          } else {
            const dueDate = new Date(f.nextDueDate);

            if (dueDate < today) {
              status = "overdue";
            } else if (dueDate - today <= 3 * 24 * 60 * 60 * 1000) {
              status = "due-soon";
            }
          }

          return (
            <div
              key={f._id}
              style={{
                border: "1px solid #ccc",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <p>
                <strong>{f.fertilizerName}</strong> –{" "}
                {f.quantity} {f.unit}
              </p>

              <p>
                📅 Applied:{" "}
                {new Date(f.appliedDate).toDateString()}
              </p>

              {f.nextDueDate && (
                <p>
                  📅 Next Due:{" "}
                  {new Date(f.nextDueDate).toDateString()}
                </p>
              )}

              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  background:
                    status === "overdue"
                      ? "#f8d7da"
                      : status === "due-soon"
                      ? "#fff3cd"
                      : "#d4edda",
                  color:
                    status === "overdue"
                      ? "#721c24"
                      : status === "due-soon"
                      ? "#856404"
                      : "#155724",
                }}
              >
                {status === "overdue" && "🔴 Overdue"}
                {status === "due-soon" && "🟡 Due Soon"}
                {status === "normal" && "🟢 Normal"}
                {status === "no-date" && "⚠️ No Schedule"}
              </span>


              {f.notes && <p>📝 {f.notes}</p>}
            </div>
          );
        })
      )}

      <button onClick={() => navigate(`/add-fertilizer?farmId=${farm._id}`)}>
        ➕ Add Fertilizer
      </button>

      <hr />
      {uiMessage && (
        <div
          style={{
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "6px",
            background:
              uiType === "success"
                ? "#d4edda"
                : uiType === "error"
                ? "#f8d7da"
                : "#e2e3e5",
            color:
              uiType === "success"
                ? "#155724"
                : uiType === "error"
                ? "#721c24"
                : "#383d41",
          }}
        >
          {uiMessage}
        </div>
      )}
      <h1>Expense</h1>
      <button
        onClick={() => navigate(`/farm/${farm._id}/expenses`)}
      >
        View Expenses
      </button>


      <button onClick={() => navigate(`/farm/${farm._id}/add-expense`)}>
        ➕ Add Expense
      </button>
      <button className="add-income-btn" onClick={() => navigate(`/farm/${farmId}/income/add`)}>
        + Add Income
      </button>





      <h3>📊 Fertilizer Recommendation</h3>

      <input
        placeholder="Fertilizer name (e.g. Urea)"
        value={fertilizerName}
        onChange={(e) => setFertilizerName(e.target.value)}
      />
      
      <br /><br />

      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
      >
        <option value="" disabled>Select Crop Stage</option>
        <option value="sowing">Sowing</option>
        <option value="seedling">Seedling</option>
        <option value="vegetative">Vegetative</option>
        <option value="flowering">Flowering</option>
        <option value="fruiting">Fruiting</option>
        <option value="harvest">Harvest</option>
      </select>


      <br /><br />

      <input
        type="date"
        value={lastDate}
        onChange={(e) => setLastDate(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Farmer Interval (optional)"
        value={farmerInterval}
        onChange={(e) => setFarmerInterval(e.target.value)}
      />

      <br /><br />

      <button onClick={calculateRecommendation}>
        {loadingRec ? "Calculating..." : "Calculate Next Fertilizer"}
      </button>

      {recommendation && (
  <div
    style={{
      marginTop: "15px",
      border: "1px solid #aaa",
      padding: "12px",
    }}
  >
    <p><strong>Next Date:</strong> {recommendation.nextDate}</p>
    <p><strong>Used Interval:</strong> {recommendation.usedInterval} days</p>
    <p><strong>Message:</strong> {recommendation.message}</p>

    <button
      onClick={applyRecommendation}
      disabled={applying}
      style={{
        marginTop: "10px",
        opacity: applying ? 0.6 : 1,
        cursor: applying ? "not-allowed" : "pointer",
      }}
    >
      {applying ? "Applying..." : "✅ Apply Recommendation"}
    </button>

  </div>
)}


      <br /><br />

      <button onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}

export default FarmDetails;

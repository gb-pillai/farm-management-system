import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FarmForm from "./pages/FarmForm";
import FertilizerForm from "./pages/FertilizerForm";
import FarmDetails from "./pages/FarmDetails";

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Login onLoginSuccess={() => navigate("/dashboard")} />
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/farm/:farmId" element={<FarmDetails />} />
      <Route path="/add-farm" element={<FarmForm />} />
      <Route path="/add-fertilizer" element={<FertilizerForm />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./Security/private-route";
import TemperatureHistory from "./pages/TemperatureHistory"; 
import HumidityHistory from "./pages/HumidityHistory";
import IncidentsHistory from "./pages/IncidentsHistory";

export default function App() { 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route path="/temperature/history" element={<TemperatureHistory />} />
        <Route path="/humidity/history" element={<HumidityHistory />} />
        <Route path="/incidents/history" element={<IncidentsHistory />} />
      </Routes>
    </BrowserRouter>
  );
}



// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./Security/private-route";
import TemperatureHistory from "./pages/TemperatureHistory"; 
import HumidityHistory from "./pages/HumidityHistory";
import IncidentsHistory from "./pages/IncidentsHistory";
import SensorManagement from "./pages/SensorManagement";
import AuditLogsHistory from "./pages/AuditLogsHistory";
import Tickets from "./pages/Tickets";
import Users from "./pages/Users";

export default function App() { 
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
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
        <Route 
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          } 
        />
        <Route
          path="/sensors"
          element={
              <PrivateRoute>
                  <SensorManagement />
              </PrivateRoute>
          }
        />
        <Route
          path="/tickets"
          element={
              <PrivateRoute>
                  <Tickets />
              </PrivateRoute>
          }
        />
        <Route path="/temperature/history" element={<TemperatureHistory />} />
        <Route path="/humidity/history" element={<HumidityHistory />} />
        <Route path="/incidents/history" element={<IncidentsHistory />} />
        <Route path="/audit" element={<AuditLogsHistory />} />
        <Route path="*" element={<h2>404 - Page non trouvée</h2>} />
      </Routes>
    </BrowserRouter>
  );
}



// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TemperatureHistory from "./pages/TemperatureHistory";
import HumidityHistory from "./pages/HumidityHistory";
import IncidentsHistory from "./pages/IncidentsHistory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/temperature/history" element={<TemperatureHistory />} />
        <Route path="/humidity/history" element={<HumidityHistory />} />
        <Route path="/incidents/history" element={<IncidentsHistory />} />
      </Routes>
    </BrowserRouter>
  );
}



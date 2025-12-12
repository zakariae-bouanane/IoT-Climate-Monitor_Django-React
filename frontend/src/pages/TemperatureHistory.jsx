// pages/TemperatureHistory.jsx
import TemperatureChart from "../charts/TemperatureChart";

export default function TemperatureHistory() {
    return (
        <div style={{ padding: 40 }}>
        <h1>Historique Température</h1>
        <TemperatureChart />
        </div>
    );
}

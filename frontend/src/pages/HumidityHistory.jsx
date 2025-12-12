// pages/HumidityHistory.jsx
import HumidityChart from "../charts/HumidityChart";

export default function HumidityHistory() {
    return (
        <div style={{ padding: 40 }}>
        <h1>Historique Humidité</h1>
        <HumidityChart />
        </div>
    );
}

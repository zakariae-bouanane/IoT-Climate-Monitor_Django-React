// pages/Dashboard.jsx
import TemperatureCard from "../components/TemperatureCard";
import HumidityCard from "../components/HumidityCard";
import IncidentsCard from "../components/IncidentsCard";
import ManualTestCard from "../components/ManualTestCard";

export default function Dashboard() {
    return (
        <div className="dashboard-container">
            <h1>Dashboard Température & Humidité (DHT11)</h1>

            <div className="cards-grid">
                <TemperatureCard />
                <HumidityCard />
                <IncidentsCard />
                <ManualTestCard />
            </div>
        </div>
    );
}

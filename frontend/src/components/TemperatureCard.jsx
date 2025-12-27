// components/TemperatureCard.jsx
import { useEffect, useState } from "react";
import { fetchLatestMeasurement } from "../api/sensorApi";
import DashboardCard from "./Card/DashboardCard";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";

export default function TemperatureCard() {
    const [latest, setLatest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const data = await fetchLatestMeasurement();
            setLatest(data);
        };

        load();
    }, []);

    return (
        <DashboardCard title="Température">
        <h2>{latest ? latest.temperature.toFixed(1) + "°C" : "..."}</h2>
        
        <p>
            {latest ? timeAgo(latest.created_at) : "Il y a : —"}
        </p>

        <button onClick={() => navigate("/temperature/history")}>
            Voir historique
        </button>
        </DashboardCard>
    );
    }

// components/TemperatureCard.jsx
import { useEffect, useState } from "react";
import { fetchMeasurements } from "../api/sensorApi";
import DashboardCard from "./Card/DashboardCard";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";

export default function TemperatureCard() {
    const [latest, setLatest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
        const data = await fetchMeasurements();
        setLatest(data[data.length - 1]);
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

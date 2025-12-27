// components/HumidityCard.jsx
import { useEffect, useState } from "react";
import { fetchLatestMeasurement } from "../api/sensorApi"; 
import DashboardCard from "./Card/DashboardCard";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";

export default function HumidityCard() {
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
        <DashboardCard title="Humidité">
        <h2>{latest ? latest.humidity.toFixed(1) + " %" : "..."}</h2>
        
        <p>
            {latest ? timeAgo(latest.created_at) : "Il y a : —"}
        </p>

        <button onClick={() => navigate("/humidity/history")}>
            Voir historique
        </button>
        </DashboardCard>
    );
}

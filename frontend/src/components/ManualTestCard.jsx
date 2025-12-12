// components/ManualTestCard.jsx
import DashboardCard from "./Card/DashboardCard";
import { useState } from "react";

export default function ManualTestCard() {
    const [temp, setTemp] = useState("");
    const [hum, setHum] = useState("");

    const handleSubmit = () => {
        console.log("Sending:", { temp, hum });
        // Call API here
    };

    return (
        <DashboardCard title="Tester l’API (manuellement)">
        <label>Température</label>
        <input
            type="number"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
        />

        <label>Humidité</label>
        <input
            type="number"
            value={hum}
            onChange={(e) => setHum(e.target.value)}
        />

        <button onClick={handleSubmit}>Envoyer pour test</button>
        </DashboardCard>
    );
}

// components/ManualTestCard.jsx
import DashboardCard from "./Card/DashboardCard";
import { useState } from "react";
import { createMeasurement } from "../api/sensorApi";

export default function ManualTestCard() {
    const [temp, setTemp] = useState("");
    const [hum, setHum] = useState("");

    const handleSubmit = async () => {
        const data = {
            temperature: temp,
            humidity: hum
        }
    try {
      const newMeasurement = await createMeasurement(data);
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
    }
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

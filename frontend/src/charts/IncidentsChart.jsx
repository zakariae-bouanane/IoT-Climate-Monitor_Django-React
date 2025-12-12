// pages/IncidentsHistory.jsx
import { useEffect, useState } from "react";
import { fetchMeasurements } from "../api/sensorApi";

export default function IncidentsHistory() {
    const [incidents, setIncidents] = useState([]);

    const MIN_TEMP = 2;
    const MAX_TEMP = 31;

    useEffect(() => {
        const load = async () => {
        const data = await fetchMeasurements();

        // Filter incidents
        const detected = data
            .filter(m => m.temperature < MIN_TEMP || m.temperature > MAX_TEMP)
            .map(m => ({
            ...m,
            reason:
                m.temperature < MIN_TEMP
                ? "Température trop basse"
                : "Température trop élevée"
            }));

            setIncidents(detected);
        };

        load();
    }, []);

    return (
        <div style={{ padding: 40 }}>
        <p style={{ marginBottom: 20 }}>
            Plage normale : {MIN_TEMP}°C à {MAX_TEMP}°C
        </p>

        {incidents.length === 0 ? (
            <p>Aucun incident détecté.</p>
        ) : (
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: 20
                }}
            >
            <thead>
                <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Température (°C)</th>
                <th style={{ padding: 8 }}>Humidité (%)</th>
                <th style={{ padding: 8 }}>Date</th>
                </tr>
            </thead>
            <tbody>
                {incidents.map((m) => (
                <tr key={m.id}>
                    <td style={{ padding: 8 }}>{m.id}</td>
                    <td style={{ padding: 8, color: "red", fontWeight: 600 }}>
                    {m.temperature.toFixed(1)}
                    </td>
                    <td style={{ padding: 8 }}>{m.humidity.toFixed(1)}</td>
                    <td style={{ padding: 8 }}>
                    {new Date(m.created_at).toLocaleString()}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </div>
    );
}

// pages/IncidentsHistory.jsx
import { useEffect, useState } from "react";
import { fetchMeasurements, fetchFirstSensor } from "../api/sensorApi";

export default function IncidentsHistory() {
    const [incidents, setIncidents] = useState([]);
    const [lastAlertId, setLastAlertId] = useState([]);
    const [MIN_TEMP, setMIN_TEMP] = useState(2);
    const [MAX_TEMP, setMAX_TEMP] = useState(31);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const load = async () => {
            const sensor = await fetchFirstSensor();
            setMIN_TEMP(sensor.min_temp);
            setMAX_TEMP(sensor.max_temp);

            const data = await fetchMeasurements();
            
            // Filtrer les incidents
            const detected = data.map(m => ({
                ...m,
                isIncident: m.temperature < sensor.min_temp || m.temperature > sensor.max_temp ? true : false,
                reason:
                    m.temperature < sensor.min_temp
                        ? "Température trop basse"
                        : "Température trop élevée"
            }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setLastAlertId(detected.find(m => m.status === "ALERT")?.id);

            setIncidents(detected);
        };

        load();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(incidents.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentIncidents = incidents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    return (
        <div style={{ padding: 40 }}>
            <p style={{ marginBottom: 20 }}>
                Plage normale : {MIN_TEMP}°C à {MAX_TEMP}°C
            </p>

            {incidents.length === 0 ? (
                <p>Aucun incident détecté.</p>
            ) : (
                <>
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
                                <th style={{ padding: 8 }}>Danger</th>
                                <th style={{ padding: 8 }}>Incident</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentIncidents.map((m) => (
                                <tr key={m.id}>
                                    <td style={{ padding: 8 }}>{m.id}</td>
                                    <td style={{ padding: 8, color: "red", fontWeight: 600 }}>
                                        {m.temperature.toFixed(1)}
                                    </td>
                                    <td style={{ padding: 8 }}>{m.humidity.toFixed(1)}</td>
                                    <td style={{ padding: 8 }}>
                                        {new Date(m.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 8, textAlign: "center" }}>
                                        {m.id === lastAlertId && m.sensor_alert_count > 6 ? (
                                            <span title="Alerte critique">🚨</span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                     <td style={{ padding: 8 }}>
                                        <button
                                            style={{
                                                padding: "4px 8px",
                                                border: "none",
                                                borderRadius: 4,
                                                color: "white",
                                                backgroundColor: m.status === 'ALERT' ? "red" : "green",
                                                cursor: "default",
                                            }}
                                        >
                                            {m.status}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination controls */}
                    <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                        <button onClick={handlePrev} disabled={currentPage === 1}>
                            Précédent
                        </button>
                        <span>
                            Page {currentPage} sur {totalPages}
                        </span>
                        <button onClick={handleNext} disabled={currentPage === totalPages}>
                            Suivant
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

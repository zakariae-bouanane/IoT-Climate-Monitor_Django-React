import { useEffect, useState } from "react";
import { fetchSensors, updateSensor } from "../api/sensorApi";
import { getCurrentUser } from "../api/authApi";
import SensorForm from "../components/SensorForm";

export default function SensorManagement() {
    const [sensors, setSensors] = useState([]);
    const [selectedSensor, setSelectedSensor] = useState(null);

    const currentUser = getCurrentUser();
    const role = currentUser?.profile?.role || currentUser?.role || null;
    const canEdit = role === "supervisor";

    const loadSensors = async () => {
        const data = await fetchSensors();
        setSensors(data);
    };

    useEffect(() => {
        loadSensors();
    }, []);

    const handleFormSubmit = async (formData) => {
        if (!selectedSensor) return;
        await updateSensor(selectedSensor.sensor_id, formData);
        setSelectedSensor(null);
        loadSensors();
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Gestion des capteurs</h1>

            <div style={styles.layout}>
                {/* Liste */}
                <div style={styles.listContainer}>
                    <table style={styles.table}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Nom</th>
                                <th style={styles.th}>Location</th>
                                <th style={styles.th}>Actif</th>
                                <th style={styles.th}>Min Temp</th>
                                <th style={styles.th}>Max Temp</th>
                                {canEdit && <th style={styles.th}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sensors.map((s) => (
                                <tr key={s.sensor_id} style={styles.tr}>
                                    <td style={styles.td}>{s.sensor_id}</td>
                                    <td style={styles.td}>{s.name}</td>
                                    <td style={styles.td}>{s.location}</td>
                                    <td style={styles.td}>{s.active ? "Oui" : "Non"}</td>
                                    <td style={styles.td}>{s.min_temp}</td>
                                    <td style={styles.td}>{s.max_temp}</td>
                                    {canEdit && (
                                        <td style={styles.td}>
                                            <button
                                                style={styles.button}
                                                onClick={() => setSelectedSensor(s)}
                                            >
                                                Modifier
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Formulaire */}
                {selectedSensor && canEdit && (
                    <div style={styles.formWrapper}>
                        <SensorForm
                            sensor={selectedSensor}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setSelectedSensor(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "30px",
        fontFamily: "Arial, sans-serif",
    },
    title: {
        textAlign: "center",
        marginBottom: "30px",
        color: "#333",
    },
    layout: {
        display: "flex",
        gap: "30px",
        alignItems: "flex-start",
        flexWrap: "wrap",
    },
    listContainer: {
        flex: 1,
        width: "100%",
        overflowX: "auto",
        background: "#fff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    tableHeader: {
        background: "#f3f4f6",
    },
    th: {
        textAlign: "left",
        padding: "10px",
        fontWeight: "bold",
        borderBottom: "1px solid #ddd",
        color: "#555",
    },
    tr: {
        "&:hover": {
            background: "#f9f9f9",
        },
    },
    td: {
        padding: "10px",
        borderBottom: "1px solid #eee",
        color: "#555",
    },
    button: {
        padding: "6px 15px",
        border: "none",
        borderRadius: "5px",
        backgroundColor: "#4F46E5",
        color: "#fff",
        cursor: "pointer",
        fontSize: "14px",
    },
    formWrapper: {
        flex: 1,
        width: "100%",
        minWidth: "300px",
    },
};

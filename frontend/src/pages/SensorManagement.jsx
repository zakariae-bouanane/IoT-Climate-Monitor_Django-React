// pages/SensorManagement.jsx
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
        <div style={{ padding: 40 }}>
            <h1>Gestion des capteurs</h1>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
                <thead>
                    <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Location</th>
                        <th>Actif</th>
                        <th>Min Temp</th>
                        <th>Max Temp</th>
                        {canEdit && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {sensors.map((s) => (
                        <tr key={s.sensor_id}>
                            <td>{s.sensor_id}</td>
                            <td>{s.name}</td>
                            <td>{s.location}</td>
                            <td>{s.active ? "Oui" : "Non"}</td>
                            <td>{s.min_temp}</td>
                            <td>{s.max_temp}</td>
                            {canEdit && (
                                <td>
                                    <button onClick={() => setSelectedSensor(s)}>Modifier</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedSensor && canEdit && (
                <SensorForm
                    sensor={selectedSensor}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setSelectedSensor(null)}
                />
            )}
        </div>
    );
}
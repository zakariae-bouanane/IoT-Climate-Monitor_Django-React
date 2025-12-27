// components/IncidentsCard.jsx
import { useEffect, useState } from "react";
import { fetchFirstSensor, fetchLatestMeasurement } from "../api/sensorApi";
import DashboardCard from "./Card/DashboardCard";
import IncidentValidation from "./IncidentValidation";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";

export default function IncidentsCard() {
    const [latest, setLatest] = useState(null);
    const [sensor, setSensor] = useState(null);
    const [isIncident, setIsIncident] = useState(false);
    const [MIN_TEMP, setMIN_TEMP] = useState(2);
    const [MAX_TEMP, setMAX_TEMP] = useState(31);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentUser(getCurrentUser());
        const load = async () => {
            const sensorData = await fetchFirstSensor();
            setSensor(sensorData);
            setMIN_TEMP(sensorData.min_temp);
            setMAX_TEMP(sensorData.max_temp);
            const last = await fetchLatestMeasurement();
            
            if(last){
                setLatest(last);

                // Determine incident status
                if (last.temperature < MIN_TEMP || last.temperature > MAX_TEMP) {
                    setIsIncident(true);
                } else {
                    setIsIncident(false);
                }
            };
        }


        load();
    }, []);
    
    return (
        <DashboardCard title="Incidents">
        {/* GREEN if no incident, RED if incident */}
        <p style={{ 
            color: sensor?.alert_count > 0 ? "red" : "green",
            fontWeight: "600"
        }}>
            {sensor?.alert_count > 0 ? "Incident détecté" : "Pas d'incident"}
        </p>

        <p>Plage normale : {MIN_TEMP}°C à {MAX_TEMP}°C</p>

        {/* Display counter dynamically */}
        <p>
            Compteur d'incidents :
            <span style={{ fontWeight: "bold" }}>
            {sensor?.alert_count}
            </span>
        </p>

        <button onClick={() => navigate("/incidents/history")}>
            Voir les événements
        </button>

        {latest?.status === "ALERT" && (
            <IncidentValidation
                measurementId={latest.id}
                userRole={currentUser.role} // USER | MANAGER | SUPERVISOR
            />
        )}

        </DashboardCard>
    );
}

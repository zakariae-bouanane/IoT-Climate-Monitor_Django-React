import { useEffect, useState } from "react";
import { fetchMeasurements } from "../api/sensorApi";
import HumidityChart from "../charts/HumidityChart";
import { exportToCsv } from "../utils/exportCsv";

export default function HumidityHistory() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchMeasurements().then(res => {
            setData(res);
            setFilteredData(res); // default: no filter
        });
    }, []);

    const applyFilter = () => {
        if (!startDate || !endDate) return;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const filtered = data.filter(m => {
            const d = new Date(m.created_at);
            return d >= start && d <= end;
        });

        setFilteredData(filtered);
    };

    return (
        <div style={{ padding: 40 }}>
            <h1>Historique Humidité</h1>

            {/* Filters */}
            <div style={{ marginBottom: 20 }}>
                <label>Du :</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />

                <label style={{ marginLeft: 10 }}>Au :</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />

                <button
                    onClick={applyFilter}
                    style={{
                        background: "#3a8fff",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "10px"
                    }}
                >
                    Filtrer
                </button>
            </div>

            {/*Export*/}
            <button
                onClick={() => exportToCsv("humidity_history.csv", filteredData)}
                style={{
                    background: "green",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "10px"
                }}
            >
                Export CSV
            </button>

            <HumidityChart data={filteredData} />
        </div>
    );
}

// charts/TemperatureChart.jsx
import React, { useEffect, useState } from "react";
import { fetchMeasurements } from "../api/sensorApi";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function TemperatureChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const load = async () => {
        const d = await fetchMeasurements();
        setData(d);
        };

        load();
        const interval = setInterval(load, 20000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="created_at" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
            type="monotone"
            dataKey="temperature"
            stroke="#ff7300"
            name="Température (°C)"
            />
        </LineChart>
        </ResponsiveContainer>
    );
}

// charts/TemperatureChart.jsx
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function TemperatureChart({ data }) {
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
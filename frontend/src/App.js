import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://192.168.1.103:8000/api/measurements/");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Cold Chain Monitoring Dashboard</h1>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="created_at" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Temperature (°C)" />
          <Line type="monotone" dataKey="humidity" stroke="#007bff" name="Humidity (%)" />
        </LineChart>
      </ResponsiveContainer>

      <table style={{ width: "100%", marginTop: 30, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>ID</th>
            <th>Sensor</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.sensor_id}</td>
              <td>{d.temperature.toFixed(1)}</td>
              <td>{d.humidity.toFixed(1)}</td>
              <td>{new Date(d.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


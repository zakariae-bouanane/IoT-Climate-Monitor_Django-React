// components/SensorForm.jsx
import { useEffect, useState } from "react";
import { fetchUsers } from "../api/userApi";

export default function SensorForm({ sensor, onCancel, onSubmit }) {
    const [form, setForm] = useState({
        name: "",
        sensor_id: "",
        location: "",
        active: true,
        user: null,
        alert_count: 0,
        min_temp: 2,
        max_temp: 8
    });
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        const loadUsers = async () => {
            const users = await fetchUsers();
            setUsersList(users);
        };
        loadUsers();
    }, []);

    useEffect(() => {
        if (sensor) {
            setForm({
                name: sensor.name,
                sensor_id: sensor.sensor_id,
                location: sensor.location,
                active: sensor.active,
                user: sensor.user || "",
                alert_count: sensor.alert_count,
                min_temp: sensor.min_temp,
                max_temp: sensor.max_temp
            });
        }
    }, [sensor]);

     const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <input
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
            />
            <input
                name="sensor_id"
                type="number"
                placeholder="ID du capteur"
                value={form.sensor_id}
                onChange={handleChange}
                required
            />
            <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
            />
            <label>
                Actif:
                <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                />
            </label>
            <input
                name="alert_count"
                type="number"
                placeholder="Compteur d'alerte"
                value={form.alert_count}
                onChange={handleChange}
            />
            <input
                type="number"
                name="min_temp"
                placeholder="Min Temp"
                value={form.min_temp}
                onChange={handleChange}
                step="0.1"
            />
            <input
                type="number"
                name="max_temp"
                placeholder="Max Temp"
                value={form.max_temp}
                onChange={handleChange}
                step="0.1"
            />
            <select name="user" value={form.user} onChange={handleChange}>
                <option value="">-- Choisir un utilisateur --</option>
                {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.username}
                    </option>
                ))}
            </select>

            <div style={{ marginTop: 10 }}>
                <button type="submit">Enregistrer</button>
                <button type="button" onClick={onCancel} style={{ marginLeft: 10 }}>
                    Annuler
                </button>
            </div>
        </form>
    );
}

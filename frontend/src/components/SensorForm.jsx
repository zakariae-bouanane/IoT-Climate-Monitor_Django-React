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
        <div style={styles.container}>
            <h2 style={styles.title}>{sensor ? "Modifier capteur" : "Ajouter capteur"}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                    <label style={styles.label}>Nom</label>
                    <input
                        name="name"
                        placeholder="Nom du capteur"
                        value={form.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>ID du capteur</label>
                    <input
                        name="sensor_id"
                        type="number"
                        placeholder="ID du capteur"
                        value={form.sensor_id}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Location</label>
                    <input
                        name="location"
                        placeholder="Emplacement"
                        value={form.location}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>
                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                            style={{ marginRight: 8 }}
                        />
                        Actif
                    </label>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Compteur d'alerte</label>
                    <input
                        name="alert_count"
                        type="number"
                        placeholder="Compteur d'alerte"
                        value={form.alert_count}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Température min</label>
                    <input
                        type="number"
                        name="min_temp"
                        placeholder="Température min"
                        value={form.min_temp}
                        onChange={handleChange}
                        step="0.1"
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Température max</label>
                    <input
                        type="number"
                        name="max_temp"
                        placeholder="Température max"
                        value={form.max_temp}
                        onChange={handleChange}
                        step="0.1"
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Utilisateur assigné</label>
                    <select name="user" value={form.user} onChange={handleChange} style={styles.select}>
                        <option value="">-- Choisir un utilisateur --</option>
                        {usersList.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.actions}>
                    <button type="submit" style={styles.button}>
                        {sensor ? "Mettre à jour" : "Créer"}
                    </button>
                    <button type="button" onClick={onCancel} style={{ ...styles.button, marginLeft: 10, backgroundColor: "#ccc", color: "#333" }}>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "500px",
        margin: "40px auto",
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    },
    title: { textAlign: "center", marginBottom: "20px", color: "#333" },
    form: { display: "flex", flexDirection: "column" },
    field: { marginBottom: "15px" },
    label: { marginBottom: "5px", fontWeight: "bold", display: "block", color: "#555" },
    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
    },
    select: {
        width: "100%",
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
        background: "#fff",
    },
    actions: { textAlign: "center", marginTop: "20px" },
    button: {
        padding: "10px 30px",
        border: "none",
        borderRadius: "5px",
        backgroundColor: "#4F46E5",
        color: "#fff",
        fontSize: "16px",
        cursor: "pointer",
    },
};

// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TemperatureCard from "../components/TemperatureCard";
import HumidityCard from "../components/HumidityCard";
import IncidentsCard from "../components/IncidentsCard";
import ManualTestCard from "../components/ManualTestCard";
import UserForm from "../components/UserForm";

import { getCurrentUser, fetchCurrentUser, useLogout  } from "../api/authApi";

export default function Dashboard() {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const logout = useLogout();

    useEffect(() => {
        setCurrentUser(getCurrentUser());
    }, []);

    const role =
        currentUser?.profile?.role || currentUser?.role || null;

    const canManageUsers =
        role === "manager" || role === "supervisor";

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard Température & Humidité (DHT11)</h1>

                <div className="dashboard-actions">
                    {canManageUsers && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/users")}
                        >
                            Manage Users
                        </button>
                    )}

                    <button
                        className="btn btn-danger"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="cards-grid">
                <TemperatureCard />
                <HumidityCard />
                <IncidentsCard />
                <ManualTestCard />
            </div>
        </div>
    );
}

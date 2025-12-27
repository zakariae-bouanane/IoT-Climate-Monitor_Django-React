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

    const canManageUsers = role === "manager" || role === "supervisor";
    const canManageSensors = role === "supervisor";
    const canViewAuditLogs = role === "manager" || role === "supervisor";
    // const canManageTickets = role === "manager" || role === "supervisor";
    const canManageTickets = false;

    return (
  <div style={styles.container}>
    <header style={styles.header}>
      <div style={styles.navLeft}>
        {canManageUsers && (
          <button
            style={styles.navButton}
            onClick={() => navigate("/users")}
          >
            Manage Users
          </button>
        )}
        {canManageSensors && (
          <button
            style={styles.navButton}
            onClick={() => navigate("/sensors")}
          >
            Manage Sensors
          </button>
        )}
        {canManageTickets && (
            <button
                style={styles.navButton}
                onClick={() => navigate("/tickets")}
            >
                🎫 Tickets
            </button>
        )}
        {canViewAuditLogs && (
          <button
            style={styles.navButton}
            onClick={() => navigate("/audit")}
          >
            Audit Logs
          </button>
        )}
      </div>

      <div style={styles.navRight}>
        <button
          style={styles.logoutButton}
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>

    <div style={styles.cardsGrid}>
      <TemperatureCard />
      <HumidityCard />
      <IncidentsCard />
      <ManualTestCard />
    </div>
  </div>
);
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "10px",
  },
  navLeft: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  navRight: {
    display: "flex",
    justifyContent: "flex-end",
    flex: "1",
  },
  navButton: {
    padding: "10px 20px",
    backgroundColor: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.3s",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#EF4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.3s",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
};
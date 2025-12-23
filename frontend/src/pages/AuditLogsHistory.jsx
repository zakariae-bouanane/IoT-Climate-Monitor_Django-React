import { useEffect, useState } from "react";
import { getAuditLogs, exportAuditLogs } from "../api/auditLogsApi";

const PAGE_SIZE = 20;

export default function AuditLogsHistory() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    useEffect(() => {
        getAuditLogs(page).then(res => {
            setLogs(res.data.results);
            setCount(res.data.count);            
        }).catch(err => {
                if (err.response?.status === 404) {
                    setPage(1);
                }
            });
    }, [page]);

     const handleExport = async () => {
        const res = await exportAuditLogs();
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = "audit_logs.csv";
        link.click();
    };

    const badgeStyle = action => {
        switch (action) {
            case "ALERT_TRIGGERED":
                return styles.badgeAlert;
            case "EMAIL_SENT":
                return styles.badgeEmail;
            case "TELEGRAM_SENT":
                return styles.badgeTelegram;
            default:
                return styles.badgeDefault;
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2>Audit Logs</h2>
                    <button style={styles.exportBtn} onClick={handleExport}>
                        Export CSV
                    </button>
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Sensor Id</th>
                            <th>Détails</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>
                                    <span style={{
                                        ...styles.badge,
                                        ...badgeStyle(log.action)
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>{log.sensor || "-"}</td>
                                <td>{log.details}</td>
                                <td>{new Date(log.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={styles.pagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                    >
                        ◀ Précédent
                    </button>

                    <span>Page {page} / {totalPages}</span>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    >
                        Suivant ▶
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        padding: "30px",
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif"
    },
    card: {
        background: "#FFFFFF",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    title: {
        fontSize: "20px",
        fontWeight: "600"
    },
    exportBtn: {
        backgroundColor: "#059669",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "8px 14px",
        cursor: "pointer",
        fontSize: "14px"
    },
    tableWrapper: {
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center"
    },
    badge: {
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        display: "inline-block"
    },
    badgeAlert: {
        backgroundColor: "#FEE2E2",
        color: "#B91C1C"
    },
    badgeEmail: {
        backgroundColor: "#DBEAFE",
        color: "#1D4ED8"
    },
    badgeTelegram: {
        backgroundColor: "#E0F2FE",
        color: "#0369A1"
    },
    badgeDefault: {
        backgroundColor: "#E5E7EB",
        color: "#374151"
    },
    details: {
        maxWidth: "400px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        marginTop: "20px"
    },
    pageBtn: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #D1D5DB",
        background: "#fff",
        cursor: "pointer"
    },
    pageInfo: {
        fontSize: "14px",
        fontWeight: "500"
    }
};

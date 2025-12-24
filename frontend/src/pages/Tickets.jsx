import { useEffect, useState } from "react";
import { getTickets, closeTicket } from "../api/ticketsApi";

export default function Tickets() {
    const [tickets, setTickets] = useState([]);

    const loadTickets = async () => {
            const res = await getTickets();
            console.log("--- res : ",res);
            setTickets(res.data.results);
        };

    useEffect(() => {
        loadTickets();
    }, []);

    return (
        <div>
            <h2>Gestion des Tickets</h2>

            <table style={styles.table}>
                <thead style={styles.tableHeader}>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Capteur</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Priorité</th>
                        <th style={styles.th}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets?.map(t => (
                        <tr key={t.id} style={styles.tr}>
                            <td style={styles.td}>{t.id}</td>
                            <td style={styles.td}>{t.sensor}</td>
                            <td style={styles.td}>{t.status}</td>
                            <td style={styles.td}>{t.priority}</td>
                            <td style={styles.td}>
                                {t.status !== "CLOSED" && (
                                    <button onClick={() => closeTicket(t.id)} style={styles.button}>
                                        Clôturer
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    container: {
        padding: "30px",
        fontFamily: "Arial, sans-serif",
    },
    title: {
        textAlign: "center",
        marginBottom: "30px",
        color: "#333",
    },
    layout: {
        display: "flex",
        gap: "30px",
        alignItems: "flex-start",
        flexWrap: "wrap",
    },
    listContainer: {
        flex: 1,
        width: "100%",
        overflowX: "auto",
        background: "#fff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    tableHeader: {
        background: "#f3f4f6",
    },
    th: {
        textAlign: "left",
        padding: "10px",
        fontWeight: "bold",
        borderBottom: "1px solid #ddd",
        color: "#555",
    },
    tr: {
        "&:hover": {
            background: "#f9f9f9",
        },
    },
    td: {
        padding: "10px",
        borderBottom: "1px solid #eee",
        color: "#555",
    },
    button: {
        padding: "6px 15px",
        border: "none",
        borderRadius: "5px",
        backgroundColor: "#4F46E5",
        color: "#fff",
        cursor: "pointer",
        fontSize: "14px",
    },
    formWrapper: {
        flex: 1,
        width: "100%",
        minWidth: "300px",
    },
};

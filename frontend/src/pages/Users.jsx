import { useEffect, useState } from "react";
import UserForm from "../components/UserForm";
import { fetchUsers } from "../api/userApi";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formUser, setFormUser] = useState(null);

    const loadUsers = async () => {
        const data = await fetchUsers();
        setUsers(data);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            if (selectedUser.id) {
                // Modification
                setFormUser({
                    id: selectedUser.id,
                    username: selectedUser.username,
                    email: selectedUser.email,
                    is_active: selectedUser.is_active,
                    password: "",
                    profile: {
                        role: selectedUser.profile?.role || "user",
                        manager: selectedUser.profile?.manager || null,
                    },
                });
            } else {
                // Ajout
                setFormUser({
                    id: null,
                    username: "",
                    email: "",
                    password: "",
                    is_active: true,
                    profile: { role: "user", manager: null },
                });
            }
        } else {
            setFormUser(null);
        }
    }, [selectedUser]);

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Gestion des utilisateurs</h1>

            <div style={{ marginBottom: 20, textAlign: "right" }}>
                <button
                    style={styles.addButton}
                    onClick={() => setSelectedUser({})}
                >
                    + Ajouter un utilisateur
                </button>
            </div>

            <div style={styles.layout}>
                
                <div style={styles.listContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Nom d'utilisateur</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Rôle</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={styles.tr}>
                                    <td style={styles.td}>{user.username}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>{user.profile?.role || "user"}</td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.button}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            Modifier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {formUser && (
                    <div style={styles.formWrapper}>
                        <UserForm
                            user={selectedUser?.id ? formUser : null}
                            usersList={users}
                            onSuccess={() => {
                                setSelectedUser(null);
                                loadUsers();
                            }}
                        />
                    </div>
                )}
            </div>
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
    addButton: {
        padding: "8px 20px",
        border: "none",
        borderRadius: "5px",
        backgroundColor: "#10B981",
        color: "#fff",
        fontSize: "14px",
        cursor: "pointer",
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
    },
};

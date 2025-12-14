import { useEffect, useState } from "react";
import UserForm from "../components/UserForm";
import { fetchUsers } from "../api/userApi";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formUser, setFormUser] = useState(null); // état pour le formulaire

    const loadUsers = async () => {
        const data = await fetchUsers();
        setUsers(data);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Préparer les données pour le formulaire dès qu'un utilisateur est sélectionné
    useEffect(() => {
        if (selectedUser) {
            setFormUser({
                id: selectedUser.id,
                username: selectedUser.username,
                email: selectedUser.email,
                is_active: selectedUser.is_active,
                password: "", // vide par défaut
                profile: {
                    role: selectedUser.profile?.role || "",
                    manager: selectedUser.profile?.manager || null,
                },
            });
        } else {
            setFormUser(null);
        }
    }, [selectedUser]);

    return (
        <div className="dashboard-container">
            <h1>Gestion des utilisateurs</h1>

            <div className="users-layout">
                {/* Liste */}
                <div className="users-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.profile?.role || "user"}</td>
                                    <td>
                                        <button onClick={() => setSelectedUser(user)}>
                                            Modifier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Formulaire */}
                {formUser && (
                    <UserForm
                        user={formUser}
                        usersList={users}
                        onSuccess={() => {
                            setSelectedUser(null);
                            loadUsers();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

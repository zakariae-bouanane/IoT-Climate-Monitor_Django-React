import { useEffect, useState } from "react";
import { createUser, updateUser } from "../api/userApi";

export default function UserForm({ user, usersList, onSuccess }) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        is_active: true,
        profile: {
            role: "user",
            manager: null,
        },
    });

    // Met à jour le formulaire quand user change
    useEffect(() => {
        if (user) {
            setForm({
                id: user.id,
                username: user.username,
                email: user.email,
                password: "", // vide pour modification
                is_active: user.is_active,
                profile: {
                    role: user.profile?.role || "user",
                    manager: user.profile?.manager || null,
                },
            });
        } else {
            setForm({
                username: "",
                email: "",
                password: "",
                is_active: true,
                profile: {
                    role: "user",
                    manager: null,
                },
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "role" || name === "manager") {
            setForm((prev) => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    [name]: name === "manager" ? (value ? parseInt(value) : null) : value,
                },
            }));
        } else if (name === "is_active") {
            setForm((prev) => ({ ...prev, [name]: e.target.checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = { ...form };
            if (!form.password) delete payload.password; // ne pas envoyer le mot de passe vide

            if (user) {
                await updateUser(form.id, payload);
            } else {
                await createUser(payload);
            }

            onSuccess();

            // Réinitialiser le formulaire
            setForm({
                username: "",
                email: "",
                password: "",
                is_active: true,
                profile: {
                    role: "user",
                    manager: null,
                },
            });
        } catch (error) {
            console.error("Erreur lors de la soumission :", error);
        }
    };

    return (
        <div className="user-form">
            <h2>{user ? "Modifier utilisateur" : "Ajouter utilisateur"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <select name="role" value={form.profile.role} onChange={handleChange}>
                    <option value="user">USER</option>
                    <option value="manager">MANAGER</option>
                    <option value="supervisor">SUPERVISOR</option>
                </select>
                <label>
                    Manager:
                    <select
                        name="manager"
                        value={form.profile.manager || ""}
                        onChange={handleChange}
                    >
                        <option value="">Aucun manager</option>
                        {usersList
                            ?.filter(
                                (u) =>
                                    u.id !== form.id &&
                                    ["manager", "supervisor"].includes(u.profile?.role)
                            )
                            .map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.profile?.role})
                                </option>
                            ))}
                    </select>
                </label>

                {!user && (
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                )}

                <button type="submit">{user ? "Mettre à jour" : "Créer"}</button>
            </form>
        </div>
    );
}

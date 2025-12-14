import { useEffect, useState } from "react";
import { createUser, updateUser } from "../api/userApi";

export default function UserForm({ user, usersList, onSuccess }) {
  const [form, setForm] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
    is_active: true,
    profile: { role: "user", manager: null },
  });

  useEffect(() => {
    if (user) {
      setForm({
        id: user.id,
        username: user.username,
        email: user.email,
        password: "",
        is_active: user.is_active,
        profile: {
          role: user.profile?.role || "user",
          manager: user.profile?.manager || null,
        },
      });
    } else {
      setForm({
        id: null,
        username: "",
        email: "",
        password: "",
        is_active: true,
        profile: { role: "user", manager: null },
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
      if (!form.password) delete payload.password;

      if (user) {
        await updateUser(form.id, payload);
      } else {
        await createUser(payload);
      }

      onSuccess();
      setForm({
        id: null,
        username: "",
        email: "",
        password: "",
        is_active: true,
        profile: { role: "user", manager: null },
      });

      if (typeof user === "undefined" || !user) return; 
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
    }
  };

  return (
    <div className="user-form-container" style={styles.container}>
      <h2 style={styles.title}>{user ? "Modifier utilisateur" : "Ajouter utilisateur"}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Nom d'utilisateur</label>
          <input
            name="username"
            placeholder="Entrez le nom d'utilisateur"
            value={form.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Entrez l'email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Rôle</label>
          <select name="role" value={form.profile.role} onChange={handleChange} style={styles.select}>
            <option value="user">USER</option>
            <option value="manager">MANAGER</option>
            <option value="supervisor">SUPERVISOR</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Manager</label>
          <select
            name="manager"
            value={form.profile.manager || ""}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Aucun manager</option>
            {usersList
              ?.filter((u) => u.id !== form.id && ["manager", "supervisor"].includes(u.profile?.role))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.profile?.role})
                </option>
              ))}
          </select>
        </div>

        {!user && (
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              name="password"
              type="password"
              placeholder="Entrez le mot de passe"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        )}

        <div style={styles.actions}>
          <button type="submit" style={styles.button}>
            {user ? "Mettre à jour" : "Créer"}
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

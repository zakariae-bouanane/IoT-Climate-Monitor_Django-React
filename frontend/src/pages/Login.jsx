import React, { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ username, password });
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur login :", err); 
      alert("Username ou mot de passe incorrect");
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE */}
      <div className="login-left">
        
        
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <h2>
          Connectez-vous
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Username ou adresse e-mail</label>
          <input
            type="text"
            placeholder="name@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Mot de passe</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </span>
          </div>

          <button type="submit" className="btn-primary">
            Se connecter
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;

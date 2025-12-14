// api/sensorApi.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`; 



// Register
export async function registerUser(data) {
  try {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data;
  } catch (error) {
    console.error("Erreur register :", error);
    throw error;
  }
}

// Login
export async function loginUser(data) {
  try {
    const res = await axios.post(`${API_URL}/login/`, data);
    saveToken(res.data.access);
    res.data.user = await fetchCurrentUser();
    return res.data;
  } catch (error) {
    console.error("Erreur login :", error);
    throw error;
  }
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("token");
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};

export const fetchCurrentUser = async() => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    saveUser(res.data);
    return res.data;
};

export function removeToken() {
  localStorage.removeItem("token");
}
export function removeCurrentUser() {
  localStorage.removeItem("currentUser");
}

export function useLogout() {
    const navigate = useNavigate();

    return () => {
        removeToken();
        removeCurrentUser();
        navigate("/login", { replace: true });
    };
}


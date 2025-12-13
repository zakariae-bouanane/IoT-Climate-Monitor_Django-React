// api/sensorApi.js
import axios from "axios";

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
    console.log("-- API_URL : ",API_URL);
    const res = await axios.post(`${API_URL}/login/`, data);
    return res.data;
  } catch (error) {
    console.error("Erreur login :", error);
    throw error;
  }
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}


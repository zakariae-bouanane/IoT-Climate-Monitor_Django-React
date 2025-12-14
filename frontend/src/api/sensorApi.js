// api/sensorApi.js
import axios from "axios";
import { axiosInstance } from "./axiosInstance";


const API_URL = `${process.env.REACT_APP_API_URL}/api`; 

export async function fetchMeasurements() {
    const res = await axios.get(`${API_URL}/measurements/`);
    
    return res.data;
}
export async function fetchFirstSensor() {
    const res = await axiosInstance.get(`${API_URL}/sensors/1`);
    
    return res.data;
}

export async function createMeasurement(data) {
  try {
    const token = localStorage.getItem("token");
    data.sensor_id = 1;

    const res = await axiosInstance.post(`${API_URL}/mesures/`, data);

    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création du measurement :", error);
    throw error;
  }
}

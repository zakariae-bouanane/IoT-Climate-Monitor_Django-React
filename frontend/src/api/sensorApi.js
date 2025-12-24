// api/sensorApi.js
import axios from "axios";
import { axiosInstance } from "./axiosInstance";


const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// export async function fetchMeasurements() {
//     const res = await axiosInstance.get(`${API_URL}/measurements/`);
    
//     return res.data;
// }

export async function fetchMeasurements(sensorId = 1) {
  try {
    const res = await axiosInstance.get(`${API_URL}/measurements/`, {
      params: {
        sensor: sensorId, // ici on envoie le query param `sensor=1`
      },
    });
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des mesures :", error);
    return [];
  }
}

export async function fetchFirstSensor() {
    const res = await axiosInstance.get(`${API_URL}/sensors/1`);
    
    return res.data;
}

export async function createMeasurement(data) {
  try {
    data.sensor_id = 1;

    const res = await axiosInstance.post(`${API_URL}/mesures/`, data);

    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création du measurement :", error);
    throw error;
  }
}

export async function fetchSensors() {
    try {
        const res = await axiosInstance.get(`${API_URL}/sensors/`);
        return res.data.results;
    } catch (error) {
        console.error("Erreur lors de la récupération des capteurs :", error);
        throw error;
    }
}

export async function fetchSensor(sensor_id) {
    try {
        const res = await axiosInstance.get(`${API_URL}/sensors/${sensor_id}/`);
        return res.data.results;
    } catch (error) {
        console.error(`Erreur lors de la récupération du capteur #${sensor_id} :`, error);
        throw error;
    }
}

export async function updateSensor(sensor_id, data) {
    try {
        const res = await axiosInstance.put(`${API_URL}/sensors/${sensor_id}/`, data);
        return res.data.results;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du capteur #${sensor_id} :`, error);
        throw error;
    }
}
// api/sensorApi.js
import axios from "axios";

const API_URL = "http://10.143.165.49:8000/api/measurements/";

export async function fetchMeasurements() {
    const res = await axios.get(API_URL);
    
    return res.data;
}

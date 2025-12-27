// api/sensorApi.js
import axios from "axios";
import { axiosInstance } from "./axiosInstance";


const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const fetchAcknowledgements = async (measurementId) => {
    const res = await axiosInstance.get(
        `${API_URL}/measurements/${measurementId}/acknowledgements/`
    );
    return res.data;
};

// export const acknowledgeIncident = async (measurementId, payload) => {
//     const res = await axiosInstance.get(
//         `${API_URL}/measurements/${measurementId}/acknowledgements/`,
//         {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(payload),
//         }
//     );
//     return res.data;
// };
export const acknowledgeIncident = async (measurementId, payload) => {
     const res = await axiosInstance.post(
        `${API_URL}/measurements/${measurementId}/acknowledge/`,
        payload
    );
    return res.data;
};
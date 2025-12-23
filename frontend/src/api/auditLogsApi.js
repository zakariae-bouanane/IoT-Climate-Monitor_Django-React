// api/sensorApi.js
import axios from "axios";
import { axiosInstance } from "./axiosInstance";


const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const getAuditLogs = (page = 1) =>
    axiosInstance.get(`${API_URL}/audit/?page=${page}`);

export const exportAuditLogs = () =>
    axiosInstance.get(`${API_URL}/audit/export/`, { responseType: "blob" });
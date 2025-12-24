import { axiosInstance } from "./axiosInstance";


const API_URL = `${process.env.REACT_APP_API_URL}/api/tickets`;

export const getTickets = () =>  axiosInstance.get(API_URL);

export const assignTicket = (id, userId) =>  axiosInstance.post(`${API_URL}/${id}/assign/`, { user_id: userId });

export const closeTicket = (id) => axiosInstance.post(`${API_URL}/${id}/close/`);
// retourner hna res.data.results;
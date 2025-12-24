import { axiosInstance } from "./axiosInstance";

const API_URL = `${process.env.REACT_APP_API_URL}/api/users`;

export const fetchUsers = async () => {
    const res = await axiosInstance.get(`${API_URL}/`);
    return res.data.results;
};

export const createUser = async (data) => {
    return axiosInstance.post(`${API_URL}/`, data);
};

export const updateUser = async (id, data) => {
    return axiosInstance.put(`${API_URL}/${id}/`, data);
};

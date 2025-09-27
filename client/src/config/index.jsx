import axios from "axios";

export const clientServer = axios.create({
    baseURL: "http://localhost:5000"
});

export const baseURL = "http://localhost:5000";
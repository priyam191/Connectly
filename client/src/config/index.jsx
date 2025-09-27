import axios from "axios";

export const clientServer = axios.create({
    baseURL: "https://connectly-prkz.onrender.com"
});

export const baseURL = "https://connectly-prkz.onrender.com";
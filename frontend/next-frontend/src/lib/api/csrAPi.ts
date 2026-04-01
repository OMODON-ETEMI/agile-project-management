
import axios from "axios";
import { getAccessToken } from "../auth-util";

const clientApi = axios.create({
  baseURL: "/api", // Next.js proxy
  withCredentials: true,
});


 clientApi.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config
  })

export default clientApi;

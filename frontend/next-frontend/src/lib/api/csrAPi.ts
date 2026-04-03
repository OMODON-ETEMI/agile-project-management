"use client";

import { useAuth } from "@/src/Authentication/authcontext";
import { useMemo } from "react";
import axios from "axios";
import { handleAxiosError } from "@/src/helpers/response-handler";

export function useClientApi() {
  const { initialToken, Logout } = useAuth(); 

  const api = useMemo(() => {
    const client = axios.create({
      baseURL: "/api",
      withCredentials: true,
    });

    client.interceptors.request.use((config) => {
      if (initialToken) {
        config.headers.Authorization = `Bearer ${initialToken}`;
      }
      return config;
    });

    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          handleAxiosError(error);
        }
        return Promise.reject(error);
      }
    );

    return client;
  }, [initialToken]); 

  return api;
}

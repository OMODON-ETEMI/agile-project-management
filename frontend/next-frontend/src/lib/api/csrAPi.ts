"use client";

import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const setApiToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.Authorization;
  }
};

export const setupResponseInterceptor = (onUnauthorized: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
};

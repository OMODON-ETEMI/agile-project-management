"use server";

import { getServerAccessToken } from "@/src/app/api/[...slug]/route";
import axios, { AxiosInstance } from "axios";
import { cookies } from "next/headers";

export async function createSSRApi(): Promise<AxiosInstance> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; '); 


        
  const api = axios.create({
    baseURL: "http://127.0.0.1:3000/api", 
    withCredentials: true,
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'isServer': 'true',
    },
  });


  api.interceptors.request.use(async (config) => {
    const token = await getServerAccessToken(api);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config
  })

  return api;
}

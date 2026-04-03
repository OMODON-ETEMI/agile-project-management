"use server";
import axios, { AxiosInstance } from "axios";
import { headers } from "next/headers";

export async function createSSRApi(): Promise<AxiosInstance> {
  const headerList = await headers();
  const token = headerList.get('x-internal-AT');

  console.log("Creating SSR API instance with token: ", token);

  const api = axios.create({
    baseURL: "http://127.0.0.1:3000/api", 
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return api;
}

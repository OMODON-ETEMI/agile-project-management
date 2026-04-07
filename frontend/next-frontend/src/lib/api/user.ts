import { User } from "@/src/helpers/type";
import { handleAxiosError } from "@/src/helpers/response-handler";
import { api } from "./csrAPi";

// 1. Get all users (or general user data)
export async function getAllUsers(): Promise<User[]> {
    try {
        const response = await api.get('/user');
        return response.data;
    } catch (error) {
        throw handleAxiosError(error);
    }
}

// 2. Find a specific user by ID 
export async function findUserById(id: string): Promise<User> {
    try {
        const response = await api.request({
            method: 'get',
            url: '/find',
            data: { _id: id } 
        });
        return response.data;
    } catch (error) {
        throw handleAxiosError(error);
    }
}

// 3. Search users by name (Query Params)
export async function searchUsers(name: string): Promise<User[]> {
    try {
        const response = await api.get('/users/search', {
            params: { name } 
        });
        return response.data;
    } catch (error) {
        throw handleAxiosError(error);
    }
}

// 4. Get current authenticated user data
export async function getMe(): Promise<User> {
    try {
        const response = await api.post('/User/me');
        return response.data;
    } catch (error) {
        throw handleAxiosError(error);
    }
}
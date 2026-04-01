import { cache } from "react";
import { AxiosInstance } from "axios";
import { Workspace } from "@/src/helpers/type";

export const getWorkspace = cache( async (api:  AxiosInstance, slug: string) => {
    const res = await api.post('/workspace/search',{slug})
    return res.data
})

export const getBoard = cache(async (api: AxiosInstance, slug: string)  => {
    const res = await api.post('/board/search', {workspace_id: slug})
    return res.data
}) 

export const getIssue = cache(async (api: AxiosInstance, slug: string) => {
    const res = await api.post('node/issue/search', {workspace_id: slug})
    return res.data
})
export const getUser = cache(async (api: AxiosInstance, slug: string) => {
    const res = await api.post('/workspace/users', {workspace_id: slug})
    return res.data
})
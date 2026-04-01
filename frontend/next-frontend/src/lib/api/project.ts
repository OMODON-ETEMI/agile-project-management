import { Project } from "@/src/helpers/type";
import api from ".";
import { handleAxiosError, handleAxiosSuccess } from "@/src/helpers/response-handler";


export async function createProject(credential: Project) {
    try {
        const response = (await api.post('/project/create', credential)).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null
    }
}

export async function searchProject(title: string){
    try {
        const response = await api.get('/project/search', {params: {title: title}})
        return response.data
    } catch (error) {
        handleAxiosError(error)
    }
}

export async function updateProject(update: Project) {
    try {
        const response = (await api.patch('/issue/update', update)).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null 
    }
}

export async function deleteIssue(object: Project) {
    try {
        const response = (await api.delete('/issue/delete', {params: {object}})).data
        handleAxiosSuccess(response.message)
    } catch (error) {
        handleAxiosError(error)
    }
}
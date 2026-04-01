import { Board } from "@/src/helpers/type";
import api from "./csrAPi";
import { handleAxiosError, handleAxiosSuccess } from "@/src/helpers/response-handler";


export async function createBoard(credential: Partial<Board>) {
    try {
        const response = (await api.post('/add/board', credential)).data
        handleAxiosSuccess(response.message)
        return response.board
    } catch (error) {
        handleAxiosError(error)
        return null
    }
}

export async function searchBoard(data?: Partial<Board>){
    try {
        if(data?.title){
        const response = await api.get(`/board/search?title=${data.title}`)
        return response.data
    }   else if(data) {
        const response = await api.post('/board/search', data)
        return response.data
    } 
    else {
        throw new Error("Either title or Workspace ID must be provided");
    }
    } catch (error) {
        handleAxiosError(error)
    }
}

export async function updateBoard(update: Board) {
    try {
        const response = (await api.patch('/board/update', update)).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null 
    }
}

export async function burndownApi(sprintID: string) {
    try {
        const response = (await api.get(`/node/issue/burndown?sprintID=${sprintID}`)).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null 
    }
}

export async function cummulativeApi(sprintID: string) {
    try {
        const response = (await api.get(`/node/issue/cummulativeFlow?sprintID=${sprintID}`)).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null 
    }
}

export async function deleteBoard(object: Board) {
    try {
        const response = (await api.delete('/board/delete', {params: {object}})).data
        handleAxiosSuccess(response.message)
    } catch (error) {
        handleAxiosError(error)
    }
}
import { Issue } from "@/src/helpers/type";
import { handleAxiosError, handleAxiosSuccess } from "@/src/helpers/response-handler";
import { api } from "./csrAPi";

export async function createIssue(credential: Partial<Issue>) {
    try {
        const response = (await api.post('node/issue/create', credential)).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        throw error 
    }
}

export async function searchIssue(data :Partial<Issue>){
    try {
        const response = await api.post('node/issue/search', data)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        throw error 
    }
}

export async function addComment(issueId: string, body: string) {
  try {
    const response = await api.post(`node/issue/${issueId}/comment`, {
      body,
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getIssueComments(issueId: string) {
  try {
    const response = await api.get(`node/issue/${issueId}/comments`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getEpics(data: string){
    try {
        const response = await api.get(`node/issue/epics/${data}`)
        return response.data.data
    } catch (error) {
        handleAxiosError(error)
    }
}

export async function updateIssueMetadata(issueId: string, updates: Partial<Issue>) {
    try {
        const response = (await api.patch('node/issue/update-metadata', {
            issueId,
            updates
        })).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null
    }
}

export async function transitionIssueStatus(issueId: string, status: string) {
    try {
        const response = (await api.post('node/issue/transition', {
            issueId,
            status
        })).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null
    }
}

export async function moveIssue(payload: {
    issueId: string
    board_id: string
    status: string
    position: number
}) {
    try {
        const response = (await api.post('node/issue/move', payload)).data
        handleAxiosSuccess(response.message)
        return response.data
    } catch (error) {
        handleAxiosError(error)
        return null
    }
}

export async function reorderColumn(payload: {
    board_id: string
    status: string
    orderedIssueIds: string[]
}) {
    try {
        const response = (await api.post('node/issue/reorder', payload)).data
        handleAxiosSuccess("Column reordered successfully")
        return response
    } catch (error) {
        handleAxiosError(error)
        return null
    }
}

export async function deleteIssue(data: {
    _id: string
}) {
    try {
        const response = (await api.delete('node/issue/delete', {params: {data}})).data
        handleAxiosSuccess(response.message)
    } catch (error) {
        handleAxiosError(error)
    }
}
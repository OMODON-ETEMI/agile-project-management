import { Workspace } from "@/src/helpers/type";
import api from "./csrAPi"; 
import {
  handleAxiosError,
  handleAxiosSuccess,
} from "@/src/helpers/response-handler";
import { AxiosInstance } from "axios";

export async function createWorkspace(credential: Object) {
  try {
    const response = (await api.post("/add/workspace", credential)).data;
    handleAxiosSuccess(response.message);
    return response.workspace;
  } catch (error) {
    handleAxiosError(error);
    return null;
  }
}

export async function searchWorkspace(params: Partial<Workspace>, Api?: AxiosInstance) {
    if (Api) {
      try {
        const response = await Api.post("/workspace/search", params);
        return response.data;
        } catch (error) {
          return {
            success: false,
            data: null,
            error: error,
          }
      }
    } else {
      try {
       const response = await api.post("/workspace/search", params);
        return response.data;
      } catch (error) {
        handleAxiosError(error);
      }
    }
}

export async function recentWorkspace() {
  try {
    const response = await api.post("/recent/workspace");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function updateWorkspace(update: Workspace) {
  try {
    const response = (await api.patch("/workspace/update", update)).data;
    handleAxiosSuccess(response.message);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null;
  }
}

export async function deleteWorkspace(object: Object) {
  try {
    const response = (await api.delete("/workspace/delete", { data: object }))
      .data;
    handleAxiosSuccess(response.message);
    return response;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function addUserToWorkspace(data: {
  workspace_id: string;
  user_id: string;
  role: string;}) {
  try {
    const response = (await api.patch("/workspace/access", data)).data;
    handleAxiosSuccess(response.message);
    return response;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function removeUserFromWorkspace(data: {
  workspace_id: string;
  user_id: string;
}) {
  try {
    const response = (await api.patch("/workspace/remove", data)).data;
    handleAxiosSuccess(response.message);
    return response;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function UsersInWorkspace(workspace_id: string) {
  try {
    const response = (await api.post("/workspace/users", { workspace_id }))
      .data;
    return response;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

export async function BoardsInWorkspace(workspace_id: string) {
  try {
    const response = (await api.post("/workspace/boards", { workspace_id }))
      .data;
    return response;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

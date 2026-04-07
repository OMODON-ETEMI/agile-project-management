import { Organisation } from "@/src/helpers/type";
import {
  handleAxiosError,
  handleAxiosSuccess,
} from "@/src/helpers/response-handler";
import { AxiosInstance } from "axios";
import { api } from "./csrAPi";

export async function createOrganisation(credential: any) {
  try {
    const response = await api.post("/add/organisation", credential);
    handleAxiosSuccess(response.data.message);
    return response.data.organisation;
  } catch (error: any) {
    handleAxiosError(error);
    return error.response;
  }
}

export async function allOrganisation(Api?: AxiosInstance) {
      if (Api) {
      try {
        const response = await Api.get("/all/organisation");
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
        const response = await api.get("/all/organisation", { params: {} });
        return response.data;
      } catch (error) {
        handleAxiosError(error);
      }
    }
}

export async function recentOrganisation() {
  try {
    const response = await api.post("/recent/organisation", {});
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function searchOrganisation(params: Partial<Organisation>) {
  try {
    const response = await api.post(`/organisation/search`, params);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function OrganisationMembers(organisation_id: string) {
  try {
    const response = await api.get(`/organisation/users`, {
      params: { organisation_id },
    });
    return response.data.results;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function SearchOrgansationMembers(
  organisation_id: string,
  query: string
) {
  try {
    const response = await api.get(`/organisation/users`, {
      params: { organisation_id, query },
    });
    return response.data.results;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function updateOrganisation(update: Partial<Organisation>) {
  try {
    const response = (await api.patch("/organisation/update", update)).data;
    handleAxiosSuccess(response.message);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null;
  }
}

export async function updateUserOrganisation(
  update: Record<string, string>,
  type: string
) {
  try {
    let response;
    type === "invite"
      ? (response = (await api.post("/organizations/invite", update)).data)
      : (response = (await api.post("/organizations/remove", update)).data);
    handleAxiosSuccess(response.message);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null;
  }
}

export async function updateUserRoleOrganisation( update: Record<string, string>) {
  try {
    const response = (await api.post("/organisation/role/update", update)).data;
    handleAxiosSuccess(response.message);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null;
  }
}

export async function deleteOrganisation(data: string) {
  try {
    const response = (
      await api.delete("/organisation/delete", {
        data: { organisation_id: data },
      })
    ).data;
    handleAxiosSuccess(response.message);
  } catch (error) {
    handleAxiosError(error);
  }
}

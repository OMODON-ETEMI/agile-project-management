// Centralized, serializable query key helpers for react-query
export const workspaceListKey = (organisationId?: string) => ["workspaces", organisationId || ""]; 
export const workspaceKey = (workspaceId?: string) => ["workspaces", workspaceId || ""]; 
export const recentWorkspaceKey = () => ["workspaces", "recent"]; 
export const usersKey = (workspaceId?: string) => ["workspaces", workspaceId || "", "users"]; 
export const boardsKey = (workspaceId?: string) => ["workspaces", workspaceId || "", "boards"]; 

export const searchWorkspacesKey = (query?: Record<string, any>) => ["searchWorkspaces", query || {}];

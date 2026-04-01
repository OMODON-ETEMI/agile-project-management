
import WorkspaceShell from "@/src/features/workspace/WorkspaceShell";
import { createSSRApi } from "@/src/lib/api/ssrApi";
import { Board, Workspace } from "@/src/helpers/type";
import { cache, ReactNode } from "react";
import { NotFoundError, UnauthorizedError } from "@/src/components/ui/error";

interface PageProps {
  params: { workspaceSlug: string };
  children: ReactNode;
}

const fetchWorkspace = async (api: any, workspaceSlug: string): Promise<Workspace | null> => {
  try {
    const response = await api.post("/workspace/search", { slug: workspaceSlug });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

const fetchBoards = async (api: any, workspaceSlug: string): Promise<Board[]> => {
  try {
    const response = await api.post("/board/search", { slug: workspaceSlug });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export default async function WorkspaceLayout({ params, children }: PageProps) {
  const api = await createSSRApi()
  const workspaceSlug = Array.isArray(params.workspaceSlug)
    ? params.workspaceSlug[0]
    : params.workspaceSlug;

  const [boards, workspace] = await Promise.all([
    fetchBoards(api, workspaceSlug),
    fetchWorkspace(api, workspaceSlug),
  ]).catch((error) => {
    const errorResponse = error.response?.data?.error || "An error occurred";

    const errorUI = error.response?.status === 404
      ? <UnauthorizedError message={errorResponse} actionLabel="Go back" actionRoute="/organisation" />
      : <NotFoundError message={errorResponse} actionLabel="Go back" actionRoute="/organisation" />;

    return [null, errorUI] as any;
  });

  return (
    <WorkspaceShell
      currentWorkspace={workspace}
      boards={boards}
      children={children}
    />
  );
}
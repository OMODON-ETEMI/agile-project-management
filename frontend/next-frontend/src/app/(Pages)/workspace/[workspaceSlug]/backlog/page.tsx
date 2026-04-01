
import BacklogShell from "./_components/BacklogShell";
import { createSSRApi } from "@/src/lib/api/ssrApi";
import { BoardWithIssues, Issue } from "@/src/helpers/type";
import { NotFoundError, UnauthorizedError } from "@/src/components/ui/error";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageProps {
  params: { workspaceSlug: string };
}

export interface Sprint {
  id: string;
  name: string;
  status: "active" | "inactive" | "completed";
  startDate?: string;
  endDate?: string;
  issues: Issue[];
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------



async function fetchBoards(workspaceSlug: string) {
    const api = await createSSRApi()
    try {
        const response : BoardWithIssues [] = (await api.post("/board/search", {slug: workspaceSlug})).data;
        return response;
    } catch (error: any) {
      throw error;
    }
    }
// ---------------------------------------------------------------------------
// Page — RSC
// ---------------------------------------------------------------------------

export default async function BacklogPage({ params }: PageProps) {
  const workspaceId = Array.isArray(params.workspaceSlug) 
  ? params.workspaceSlug[0] 
  : params.workspaceSlug;


  const boards: BoardWithIssues[] = await fetchBoards(params.workspaceSlug).catch((error) => {
    const errorResponse = error.response?.data?.error || "An error occurred";

    const errorUI = error.response?.status === 404
      ? <UnauthorizedError message={errorResponse} actionLabel="Go back" actionRoute="/organisation" />
      : <NotFoundError message={errorResponse} actionLabel="Go back" actionRoute="/organisation" />;

    return [null, errorUI] as any;
  })

  return (
    <BacklogShell
      workspaceId={workspaceId}
      initialBoards={boards}
    />
  );
}
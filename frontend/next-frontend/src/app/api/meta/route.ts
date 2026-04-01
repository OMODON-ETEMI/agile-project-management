
import { NextRequest, NextResponse } from "next/server";
import { createSSRApi } from "@/src/lib/api/ssrApi";
 
export async function GET(req: NextRequest) {
    const api = await createSSRApi()
    const  { searchParams } = req.nextUrl;

    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }
  
  try {
    const [epics, users, boards] = await Promise.all([
    api.get(`/node/issue/epics/${workspaceId}`),
    api.post(`/workspace/users`, { workspace_id: workspaceId }),
    api.post('/workspace/boards', { workspace_id: workspaceId })
    ]);
     return NextResponse.json({
      epics: epics.data,
      users: users.data,
      boards: boards.data,
    });
  } catch (error) {
    console.log("Error from metacontext",error)
    const message = error instanceof Error ? error.message : "Unknown error";

    return  NextResponse.json({ error: message }, { status: 400 });
  
  }

}
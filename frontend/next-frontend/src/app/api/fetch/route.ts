import { Organisation, Workspace } from "@/src/helpers/type"
import { createSSRApi } from "@/src/lib/api/ssrApi"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest){
    // console.log("Request: ", req)
    const api = await createSSRApi()
    const { slug } = await req.json()
    try {
          const organisation : Organisation = (await api.post("/organisation/search", { slug })).data
          const workspace : Workspace [] = (await api.post("/workspace/search", {organisation_id: organisation._id})).data
          return NextResponse.json({organisation, workspace})
    } catch (error: any) {
        // console.error("Error fetching organisation or workspaces:", error)
        return NextResponse.json({ error: "Failed to fetch organisation or workspaces" }, { status: error.response?.status || 500 })
    }
}


// TO BE DELETED
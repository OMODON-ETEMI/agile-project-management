"use client"
import { useAuth } from "@/src/Authentication/authcontext"
import { Workspace } from "@/src/helpers/type"

export const SetWorkspace = ({workspace}:{workspace : Workspace[]} ) => {
    const {setWorkspace} = useAuth()
    setWorkspace(workspace)
    return null
        }

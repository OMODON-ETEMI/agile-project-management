"use client";

import { useEffect } from "react";
import { useAuth } from "../Authentication/authcontext";
import { Organisation, Workspace } from "../helpers/type";

interface HydrateAuthProps {
    organisation?: Organisation[];
    workspace?: Workspace[];
}

export function HydrateAuth({ organisation, workspace }: HydrateAuthProps) {
    const { setIsLoading, setOrganisation, setWorkspace } = useAuth();

    useEffect(() => {
        const hydrate = async () => {
            try {
                setIsLoading(true);

                if (organisation && organisation.length > 0) {
                    setOrganisation(organisation);
                }

                if (workspace && workspace.length > 0) {
                    setWorkspace(workspace);
                }
            } catch (error) {
                console.error("Error hydrating auth context:", error);
            } finally {
                setIsLoading(false);
            }
        };

        hydrate();
    }, [organisation, workspace]);

    return null;
}

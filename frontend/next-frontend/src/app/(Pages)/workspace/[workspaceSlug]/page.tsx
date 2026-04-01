"use client";

import Loading from "./loading";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";


export default function WorkspacePage() {
  const [isStorageReady, setIsStorageReady] = React.useState(false);
  const params = useParams();
  const router = useRouter();
  
  const workspaceSlug = Array.isArray(params.workspaceSlug)
    ? params.workspaceSlug[0]
    : params.workspaceSlug;

  useEffect(() => {
      const savedId = localStorage.getItem("last_board_id");
      
      if (workspaceSlug) {
        if (savedId) {
          router.push(`/workspace/${workspaceSlug}/${savedId}`);
        } else {
          router.push(`/workspace/${workspaceSlug}/backlog`);
        }
      }
      
      setIsStorageReady(true);
    }, [workspaceSlug, router]);

}
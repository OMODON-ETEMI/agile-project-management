"use client"

import {
  CalendarDays,
  Building2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Organisation, Workspace } from "@/src/helpers/type";
import { formatDate } from "@/src/helpers/formatDate";



export default function OrgMeta({
  Organisation,
  Workspace,
}: {
  Organisation: Organisation;
  Workspace: Workspace[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
      <div className="flex items-center text-gray-400 font-mono">
        <CalendarDays className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
        <span>{formatDate(Organisation.createdAt)}</span>
      </div>

      <Separator orientation="vertical" className="h-3.5 hidden sm:block" />

      <Badge
        variant="secondary"
        className="bg-[#0052CC]/8 text-[#0052CC] border border-[#0052CC]/15 
          hover:bg-[#0052CC]/12 transition-colors text-[11px]"
      >
        <Building2 className="w-3 h-3 mr-1" />
        {Workspace.length} Workspace{Workspace.length !== 1 ? "s" : ""}
      </Badge>

      {Organisation.admin && (
        <>
          <Separator orientation="vertical" className="h-3.5 hidden sm:block" />
          <Badge
            variant="outline"
            className="text-gray-500 border-gray-200 text-[11px]"
          >
            <User className="w-3 h-3 mr-1" />
            {Organisation.admin.username}
          </Badge>
        </>
      )}
    </div>
  );
}
'use client'
import React from "react";
import { ChartLine, ChartNoAxesGantt, ChevronDown, CloudDownload, Maximize2, MoreHorizontal, Search } from 'lucide-react';
import Button from "./button";
import { Input } from "@/components/ui/input";
import AvatarComponent from "./avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/src/Authentication/authcontext";

export const Backlog = () => {
    return (
        <div>
            <ChartNoAxesGantt />
            <span>Backlog</span>
        </div>
    )
}

export const BacklogHeader = () => {
    const { currentUser } = useAuth()
    if (!currentUser) return null
    return (
       <>
         <div className="px-3 py-2 flex justify-between items-center">
            <h1 className="text-xl font-medium">Backlog</h1>
            <div className="flex space-x-2">
                <Button variant="empty" >
                    <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="empty">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>

            {/* Search and Tools Bar */}
            <div className="px-3 py-2 flex items-center space-x-3 border-b border-gray-200 pb-2 text-xs font-semibold">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-9 w-48 h-9" />
                </div>

                <AvatarComponent user={currentUser}/>

                <Button variant="empty" className="text-gray-600 flex items-center gap-1">
                    <span>Invite</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="empty" className="flex items-center gap-1">
                            <div className="flex items-center">
                            <span>Epic</span>
                            <ChevronDown className="h-3 w-3" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>View Epics</DropdownMenuItem>
                        <DropdownMenuItem>Create Epic</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-grow"></div>

                <Button variant="secondary" className="flex items-center gap-1">
                    <div className="flex">
                    <CloudDownload className="h-4 w-4" />
                    <span className="ml-1">Import work</span>
                    </div>
                </Button>

                <Button variant="secondary" className="flex items-center gap-1">
                    <div className="flex">
                    <ChartLine className="h-4 w-4" />
                    <span className="ml-1">Insights</span>
                    </div>
                </Button>

                <Button variant="secondary" className="flex items-center gap-1">
                    <span>View settings</span>
                </Button>
            </div>
        </>
    )
}

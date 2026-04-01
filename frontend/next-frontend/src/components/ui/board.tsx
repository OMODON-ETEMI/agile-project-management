// "use client"
// import React, { useState } from "react";
// import { Calendar1Icon, ChevronDown, Columns3, MoreHorizontal } from 'lucide-react';
// import Button from "./button";
// import { Badge } from "@/components/ui/badge";
// import AvatarComponent from "./avatar";
// import { Board, Issue, StatusData, } from "@/src/helpers/type";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import Icon, { IconType } from "@/src/helpers/icon";
// import { CreateIssueForm } from "./createIssue";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import BoardHeader from "@/src/app/(Pages)/board/[BoardID]/_component/ListBoardHeader";
// import IssueContent from "@/src/app/(Pages)/board/[BoardID]/_component/BoardContent";



// interface ListBoardViewProps {
//     Boards: Board[]
// }

// export const BoardList = () => {
//     return (
//         <div>
//             <Columns3 />
//             <span>Board</span>
//             <span>Sprint 1</span>
//             <span>Sprint 2</span>
//         </div>
//     )
// }

// export const ListBoardView = ({ Boards }: ListBoardViewProps) => {
//     const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
 
//     return (
//         <>
//             {Boards.map((board, index) => (
//                 <div className="px-4 py-2 border-b border-gray-200" key={index}>
//                     <BoardHeader board={board} setExpandedSections={setExpandedSections} expandedSections={expandedSections}/> 
//                     <IssueContent issue={board.issues} expanded={expandedSections[board._id]} />
//                 </div>
//             ))}
//         </>
//     )
// }
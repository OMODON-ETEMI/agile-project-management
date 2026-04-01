"use client";

import React from "react";
import { Issue } from "@/src/helpers/type";


interface IssueListCardProps {
    issue: Issue
}

// export function IssueListCard ({issue}: IssueListCardProps) {
//      return (
//     <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow transition">
//         <div>ISSUE 1</div>
//       <div className="flex justify-between items-start mb-1">
//         <h3 className="text-base font-semibold">{issue.title}</h3>
//         <span className="text-xs text-slate-500 dark:text-slate-400">{issue._id}</span>
//       </div>

//       <div className="text-xs text-slate-600 dark:text-slate-400 italic flex justify-between">
//         <span>{issue.status}</span>
//         {issue.assignees && <span>Assigned to {issue.assignees}</span>}
//       </div>
//     </div>
//   );
// }

// components/IssueTable.tsx
import Image from "next/image";

const issues = [
  {
    key: "ISSUE-1",
    summary: "Implement user authentication module",
    typeIcon: "/icons/bug.png",
    status: "Open",
    assignee: "Alex",
    priority: "High",
    label: "Authentication",
  },
  {
    key: "ISSUE-2",
    summary: "Design database schema for user profiles",
    typeIcon: "/icons/database.png",
    status: "In Progress",
    assignee: "Chris",
    priority: "Medium",
    label: "Database",
  },
  {
    key: "ISSUE-3",
    summary: "Develop API endpoints for profile management",
    typeIcon: "/icons/api.png",
    status: "To Do",
    assignee: "Jordan",
    priority: "Low",
    label: "API",
  },
  {
    key: "ISSUE-4",
    summary: "Create unit tests for API endpoints",
    typeIcon: "/icons/testing.png",
    status: "To Do",
    assignee: "Jordan",
    priority: "Low",
    label: "Testing",
  },
  {
    key: "ISSUE-5",
    summary: "Document API usage for frontend developers",
    typeIcon: "/icons/documentation.png",
    status: "To Do",
    assignee: "Jordan",
    priority: "Low",
    label: "Documentation",
  },
];

export function IssueListCard({issue}: IssueListCardProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm text-left text-gray-900 bg-white">
        <tbody>
          {issues.map((issue) => (
            <tr
              key={issue.key}
              className="border-b hover:bg-gray-50 transition-all"
            >
              <td className="px-6 py-4 font-medium">{issue.key}</td>
              <td className="px-6 py-4 text-gray-700">{issue.summary}</td>
              <td className="px-6 py-4">
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={issue.typeIcon}
                    alt="type icon"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                  {issue.status}
                </span>
              </td>
              <td className="px-6 py-4 text-blue-600 font-medium">
                {issue.assignee}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                  {issue.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                  {issue.label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

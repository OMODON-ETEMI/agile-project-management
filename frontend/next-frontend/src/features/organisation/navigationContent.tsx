// components/DashboardCards.tsx
"use client";

import { Organisation } from "@/src/helpers/type";
import { Inbox, MoreHorizontal } from "lucide-react";
import { CreateOrganizationModal } from "./createOrganisation";
import Button from "@/src/components/ui/button";
import Link from "next/link";

const EmptyState = ({
  title,
  message,
  actionText,
}: {
  title: string;
  message: string;
  actionText: string;
}) => (
  <>
    <div className="flex flex-col items-center justify-start space-y-2 py-2 w-[200px]">
      <div className="rounded-full bg-muted/50 p-3">
        <Inbox className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-1 text-center">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <hr className="w-full border-t border-gray-300 my-4" />
      <Button variant="empty" className="h-8 text-xs">
        {actionText}
      </Button>
    </div>
  </>
);

// Replace `null` with your actual logic/data checks
export const AssignedToMeModal = ({ data }: { data?: any[] }) =>
  data && data.length ? (
    <div>Assigned To Me Modal</div>
  ) : (
    <EmptyState
      title="No open issues"
      message="You have no open issues assigned to you"
      actionText="Go to Your Work page"
    />
  );

export const RecentWorkInline = ({ data }: { data?: any[] }) =>
  data && data.length ? (
    <div>Recent Work Inline Content</div>
  ) : (
    <EmptyState
      title="No recent work"
      message="You haven't interacted with any tasks recently"
      actionText="View all workspaces"
    />
  );

export const RecentOrganisationsInline = ({ data }: { data?: Organisation[] | null }) =>
  data && data.length ? (
    <div className="w-[340px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">

      {/* Organizations List */}
      <div className="max-h-80 overflow-y-auto">
        {/* Section Header */}
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            RECENT ORGANISATION
          </h3>
        </div>

        {data.map((org, index) => (
          <div key={org._id}>
            <Link href={`/organisation/${org.slug}`} >
              <div className="px-3 py-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    {/* Organization Avatar */}
                    {org.image?.imageFullUrl ? (
                      <img
                        src={org.image.imageFullUrl}
                        alt={org.title}
                        className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold mt-0.5"
                        style={{ backgroundColor: org.color }}
                      >
                        {org.title.match(/\(([^)]+)\)/)?.[1]?.substring(0, 2) || org.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Organization Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {org.title}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-500">
                        {org.description}
                      </p>

                    </div>
                  </div>

                  {/* More Options */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>


            {/* Divider between items */}
            {index < data.length - 1 && (
              <div className="border-b border-gray-100 mx-3"></div>
            )}
          </div>

        ))}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-100">
        <Link href="/organisation">
          <button className="w-full px-3 py-3 text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            View all organizations
          </button>
        </Link>

        <div className="border-t border-gray-100">
          <CreateOrganizationModal
            definedUI={
              <button
                className="w-full px-3 py-3 text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Create organization
              </button>
            }
          />

        </div>
      </div>
    </div>
  ) : (
    <EmptyState
      title="No recent organisations"
      message="You haven't opened any organisations yet"
      actionText="Create a new organisation"
    />
  );

export const CreateOrganisationModal = ({ data }: { data?: any }) =>
  data ? (
    <div>Create Organisation Modal</div>
  ) : (
    <EmptyState
      title="No organisations"
      message="Start by creating an organisation"
      actionText="Create one now"
    />
  );

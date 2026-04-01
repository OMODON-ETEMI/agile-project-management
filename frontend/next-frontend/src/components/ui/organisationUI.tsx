import { Organisation } from "@/src/helpers/type";
import Link from "next/link";

interface OrganisationProp{
  organization: Organisation
}

// OrganizationCard Component
export const OrganizationCard: React.FC<OrganisationProp> = ({organization}) => {
    return (
      <div className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md ">
        <Link href={`/organisation/${organization.slug}`}>
        <div className="flex items-start space-x-4">
          <div
            className="h-10 w-10 flex-shrink-0 rounded-full"
            style={{ backgroundColor: organization.color }}
          />
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900">
              {organization.title}
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                {organization.workspace_count} Workspaces
              </p>
              {organization.lastAccessed && (
                <p className="text-sm text-gray-500">
                  Last accessed: {organization.lastAccessed}
                </p>
              )}
            </div>
          </div>
        </div>
        </Link>
      </div>
    );
  };
  
  // OrganizationListItem Component
  export const OrganizationListItem:React.FC<OrganisationProp> = ({organization}) => {
    return (
      <div className="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50">
        <div
          className="h-8 w-8 flex-shrink-0 rounded-full"
          style={{ backgroundColor: organization.color }}
        />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {organization.title}
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          {organization.workspace_count} Workspaces
        </div>
      </div>
    );
  };
  
  export default {
    OrganizationCard,
    OrganizationListItem
  };
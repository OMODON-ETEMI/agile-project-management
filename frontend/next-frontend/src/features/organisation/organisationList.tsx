
import { Organisation } from "@/src/helpers/type";
import Link from "next/link";
import { Building2, ChevronRight} from "lucide-react"; // Import icons
import { Badge } from "@/components/ui/badge";

interface OrganisationListItemProps {
    organisation: Organisation
}

export const OrganizationListItem = ({ organisation }: OrganisationListItemProps) => {
  return (
    <Link href={`/organisation/${organisation.slug}`}>
      <div className="group w-full min-h-[60px] border rounded-lg flex items-center bg-white px-4 py-3 
        shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-200 
        sm:px-6 relative overflow-hidden">
        {/* Organization Initial Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center 
          text-indigo-600 font-semibold text-sm transition-colors group-hover:bg-indigo-200">
          {organisation.title?.charAt(0).toUpperCase()}
        </div>

        {/* Organization Info - Middle Section */}
        <div className="ml-4 flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {organisation.title}
            </h3>
            <Badge 
              variant="secondary" 
              className="w-fit text-xs py-0.5 px-2 bg-gray-100/80"
            >
              <Building2 className="w-3 h-3 mr-1" />
              {organisation.workspace_count} 
              <span className="hidden sm:inline ml-1">
                Workspace{Number(organisation.workspace_count) > 1 ? "s" : ""}
              </span>
            </Badge>
          </div>
          
          {/* Optional: Add description or other details */}
          {organisation.description && (
            <p className="text-xs text-gray-500 mt-1 truncate hidden sm:block">
              {organisation.description}
            </p>
          )}
        </div>

        {/* Right Arrow - Visual Indicator */}
        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 transition-transform 
          group-hover:transform group-hover:translate-x-1" />

        {/* Hover Effect Border */}
        <div className="absolute inset-x-0 h-[2px] bottom-0 bg-indigo-500 transform origin-left 
          scale-x-0 transition-transform group-hover:scale-x-100" />
      </div>
    </Link>
  );
};
import { Organisation } from "@/src/helpers/type";
import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrganisationGridItemProps {
  organisation: Organisation;
}

export const OrganisationGridItem = ({ organisation }: OrganisationGridItemProps) => {
  return (
    <Link href={`/organisation/${organisation.slug}`}>
      <div className="group relative flex flex-col h-full rounded-xl border bg-white 
        p-5 shadow-sm transition-all duration-200 
        hover:shadow-lg hover:border-indigo-200
        sm:p-6">
        {/* Top Section with Avatar */}
        <div className="flex items-start justify-between mb-4">
          {/* Avatar/Logo */}
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center 
            justify-center text-indigo-600 font-bold text-lg
            transition-colors group-hover:bg-indigo-200 group-hover:scale-105">
            {organisation.title?.charAt(0).toUpperCase()}
          </div>
          
          {/* Workspace Badge */}
          <Badge variant="secondary" 
            className="bg-gray-100/80 text-xs py-1 px-2 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {organisation.workspace_count}
          </Badge>
        </div>

        {/* Content Section */}
        <div className="flex-grow">
          <h3 className="font-semibold text-base text-gray-900 mb-2 
            group-hover:text-indigo-700 transition-colors line-clamp-2">
            {organisation.title}
          </h3>
          
          {/* Optional Description */}
          {organisation.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {organisation.description}
            </p>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-4 flex items-center justify-between 
          border-t border-gray-100">
          {/* Member count or other metadata */}
          <span className="text-xs text-gray-500">
            Created {new Date(organisation.createdAt.$date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
          
          {/* Chevron icon */}
          <ChevronRight className="w-4 h-4 text-gray-400 
            transition-transform group-hover:translate-x-1" />
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-x-0 h-[2px] bottom-0 bg-indigo-500 
          transform origin-left scale-x-0 transition-transform 
          group-hover:scale-x-100" />
      </div>
    </Link>
  );
};
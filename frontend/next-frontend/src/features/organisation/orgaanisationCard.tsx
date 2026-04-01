import { Organisation } from "@/src/helpers/type";

interface OrganisationCardProps {
    organisation: Organisation
}

export const OrganizationCard = ({ organisation }: OrganisationCardProps) => {
  return (
    <div className="w-[350px] h-[120px] p-6 relative hover:shadow-lg transition-shadow">
      <div 
        className="absolute left-6 top-6 w-10 h-10 rounded-full"
        style={{ }}
      />
      <div className="ml-16">
        <h3 className="font-semibold text-gray-900">{organisation.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{} members</p>
        {organisation.lastAccessed && (
          <p className="text-sm text-gray-500 mt-1">
            Last accessed: {organisation.lastAccessed}
          </p>
        )}
      </div>
    </div>
  );
};
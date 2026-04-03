
import { Organisation } from "@/src/helpers/type";
import { allOrganisation } from "@/src/lib/api/organisation";
import NoOrganisation from "./_components/noOrganisation";
import OrganisationPage from "./_components/orgnisation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { createSSRApi } from "@/src/lib/api/ssrApi";
import { NotFoundError, UnauthorizedError } from "@/src/components/ui/error";


export default async function OrganizationsPage() {

  console.log("Fetching organisations for SSR...");
  const api = await createSSRApi()
  const response = await allOrganisation(api)
  console.log("SSR organisations response: ", response);
  if(response.error){
    if (response.error.response.status === 404) {
    return (
      <UnauthorizedError
        message={response.error.response.data.error || "Failed to fetch organisations"}
        actionLabel="Go Back"
        actionRoute="/organisation"
      />
    );
  } else if (response.error.response.status === 401) {
    return (
      <NotFoundError
        message={response.error.response.data.error || "Unauthorized access to organisations"}
        actionLabel="Go Back"
        actionRoute="/organisation"
      />
    );
  }
  }
  const organisationData: Organisation[] = response || [];


  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['allOrganisations'],
    queryFn: () => allOrganisation(api),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-500">
      {organisationData.length === 0 || !organisationData ? (
        <NoOrganisation />
      ) : (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <OrganisationPage />
        </HydrationBoundary>)}
    </div>
  );
}
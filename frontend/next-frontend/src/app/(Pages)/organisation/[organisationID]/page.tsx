
import { Organisation, Workspace } from "@/src/helpers/type";
import { RecentActivitySection } from "./_components/activity";
import { AdministratorsSection } from "./_components/Administration";
import { OrganizationHeader } from "./_components/Organisationheader";
import { WorkspacesSection } from "./_components/workspace";
import { AnimatedWrapper } from "@/src/components/shared/motion";
import { createSSRApi } from "@/src/lib/api/ssrApi";
import { HydrateAuth } from "@/src/hooks/hydrate";
import { NotFoundError, UnauthorizedError } from "@/src/components/ui/error";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { searchWorkspace } from "@/src/lib/api/workspace";



export default async function OrganizationDetailsPage({params}: {params :  {organisationID : string}}) {

  let organisation: Organisation | null = null;
  let workspace: Workspace[] = [];
  const api = await createSSRApi()

  try{
    organisation = (await api.post("/organisation/search", {slug: params.organisationID})).data  
    workspace = (await api.post("/workspace/search", {organisation_id: organisation?._id})).data
  } catch (error: any){
    return UnauthorizedError({
      message: error,
      actionLabel: 'Go Back',
      actionRoute: '/organisation'
    })
  }

  const key = workspace.length > 0 
  ? `${workspace.length}-${workspace[workspace.length - 1]._id}` 
  : "empty";

  if(!organisation){
    return <NotFoundError message="Organisation not found" actionLabel='Go Back' actionRoute="/organisation" />
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['workspaces', organisation._id],
    queryFn: () => searchWorkspace({organisation_id: organisation._id}, api)
  })


  return (
    <div className="container max-w-5xl mx-auto px-4 py-4 space-y-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HydrateAuth workspace={workspace}/>
          {/* <SetWorkspace workspace={workspace} /> */}
        <AnimatedWrapper direction="FromRight" className="mb-4">
          <OrganizationHeader 
            Organisation={organisation}
            Workspace={workspace}    // from your query
          />
        </AnimatedWrapper>
          
        <AnimatedWrapper direction="FromBottom" className="mb-4">
          <AdministratorsSection administrators={organisation.admin} />
        </AnimatedWrapper>

        <AnimatedWrapper direction="FromLeft" className="mb-2">
          <WorkspacesSection key={key} organisation={organisation} />
        </AnimatedWrapper>
          
        <RecentActivitySection />
      </HydrationBoundary>
    </div>
  );
}
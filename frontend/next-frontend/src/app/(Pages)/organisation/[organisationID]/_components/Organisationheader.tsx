"use client"

import { useEffect, useTransition } from "react";
import { motion  } from "framer-motion";
import OrganisationSettingsPage from "../settings/page";
import { Organisation, User, Workspace } from "@/src/helpers/type";
import { useOrgStore } from "@/src/hooks/store";
import OrgMeta from "./Orgmeta";
import GlassCard from "@/src/components/shared/Glasscard";
import GreetingBanner from "@/src/components/shared/Greetingbanner";
import OrgSwitcher from "./Orgswitch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/Authentication/authcontext";
import { useOrganisations } from "@/src/lib/api/reactQuery";
import { LoadingCard } from "@/src/components/ui/skeleton";

interface OrganizationHeaderProps {
  Organisation: Organisation;
  Workspace: Workspace[];
}

export const OrganizationHeader = ({
  Organisation,
  Workspace,
}: OrganizationHeaderProps) => {
  const { setCurrentOrg } = useOrgStore();
  const router = useRouter();
  const [isPending, startTransation] = useTransition()

  useEffect(() => {
    setCurrentOrg(Organisation._id);
  }, [Organisation._id, setCurrentOrg]);

  const { currentUser } = useAuth()
  const { data: allOrganisations } = useOrganisations()

  // Fallback: if no allOrganisations passed, just show current
  const orgs = allOrganisations?.length ? allOrganisations : [Organisation];

  const switchOrg = (orgslug: string) => {
    startTransation(() => {
    router.push(`/organisation/${orgslug}`)
    })
  };

  isPending && <> <LoadingCard /> </>


  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <GlassCard>
        {/* Ambient glow top-left */}
        <div
          className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 
            rounded-full bg-[#0052CC]/6 blur-3xl"
        />

        <div className="relative px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4">
          
          {/* ── Row 1: Greeting + Settings ── */}
          <div className="flex items-start justify-between gap-4">
            <GreetingBanner user={currentUser ? currentUser : undefined} />
            {/* Settings hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex flex-shrink-0 items-center">
              <OrganisationSettingsPage
                Organisation={Organisation}
                Workspace={Workspace}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-[#0052CC]/10 via-gray-200 to-transparent" />

          {/* ── Row 2: Org Switcher + Meta ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
              {/* Org Switcher */}
              <OrgSwitcher
                current={Organisation}
                all={orgs}
                onSwitch={switchOrg}
              />
              {/* Meta badges — stacked on mobile, inline on desktop */}
              <div className="hidden xs:block">
                <OrgMeta Organisation={Organisation} Workspace={Workspace} />
              </div>
            </div>

            {/* Settings on mobile */}
            <div className="flex sm:hidden items-center justify-between">
              <OrgMeta Organisation={Organisation} Workspace={Workspace} />
              <OrganisationSettingsPage
                Organisation={Organisation}
                Workspace={Workspace}
              />
            </div>
          </div>

          {/* Meta on xs+ (below switcher on small screens) */}
          <div className="block xs:hidden">
            <OrgMeta Organisation={Organisation} Workspace={Workspace} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
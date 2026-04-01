"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HeroSection } from "@/src/features/organisation/hero-section"
import { StatsSection } from "@/src/features/organisation/stats-section"
import { SearchFilterSection } from "@/src/features/organisation/search-filter-section"
import { OrganizationDisplay } from "@/src/features/organisation/organisation-display"
import { OrganizationModals } from "@/src/features/organisation/organisation-modals"
import { FooterSection } from "@/src/features/organisation/footer-section"
import { Organisation } from "@/src/helpers/type"
import NoOrganisation from "./noOrganisation"
import { useOrganisations } from "@/src/lib/api/reactQuery"


export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null)

  // Modal states
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false)
  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null)


  const {data: organisation} = useOrganisations()

  if (!organisation) {
    return <NoOrganisation /> 
  }

  const filteredOrganizations = organisation.filter(
    (org) =>
      org.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.admin.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateOrg = () => setIsCreateOrgModalOpen(true)

  const handleEditOrg = (org: Organisation) => {
    setSelectedOrg(org)
    setIsEditOrgModalOpen(true)
  }

  const handleAddUser = (org: Organisation) => {
    setSelectedOrg(org)
    setIsAddUserModalOpen(true)
  }

  const handleSettings = (org: Organisation) => {
    setSelectedOrg(org)
    setIsSettingsModalOpen(true)
  }

  const handleViewWorkspaces = (org: Organisation) => {
    setExpandedOrgId(expandedOrgId === org._id ? null : org._id)
  }

  const handleCreateWorkspace = (org: Organisation) => {
    alert(`Creating workspace for ${org.title}`)
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%)",
              "radial-gradient(circle at 75% 75%, hsl(var(--accent)) 0%, transparent 50%)",
              "radial-gradient(circle at 25% 75%, hsl(var(--primary)) 0%, transparent 50%)",
              "radial-gradient(circle at 75% 25%, hsl(var(--accent)) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 py-16">
        <HeroSection onCreateOrg={handleCreateOrg} />

        <StatsSection organizations={organisation} />

        <SearchFilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <OrganizationDisplay
          organisations={filteredOrganizations}
          viewMode={viewMode}
          expandedOrgId={expandedOrgId}
          onViewWorkspaces={handleViewWorkspaces}
          onEditOrg={handleEditOrg}
          onAddUser={handleAddUser}
          onSettings={handleSettings}
          onCreateWorkspace={handleCreateWorkspace}
        />

        <FooterSection />
      </div>

      <OrganizationModals
        isCreateOrgModalOpen={isCreateOrgModalOpen}
        setIsCreateOrgModalOpen={setIsCreateOrgModalOpen}
        isEditOrgModalOpen={isEditOrgModalOpen}
        setIsEditOrgModalOpen={setIsEditOrgModalOpen}
        isAddUserModalOpen={isAddUserModalOpen}
        setIsAddUserModalOpen={setIsAddUserModalOpen}
        isSettingsModalOpen={isSettingsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        selectedOrg={selectedOrg}
      />
    </div>
  )
}

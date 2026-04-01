"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Edit, Settings, UserPlus, FolderOpen, Calendar, Users, Plus } from "lucide-react"
import { Organisation, Workspace } from "@/src/helpers/type"
import { useWorkspaceQueries } from "@/src/lib/api/reactQuery"
import Link from "next/link"
import { formatDate } from "@/src/helpers/formatDate"

interface OrganizationDisplayProps {
  organisations: Organisation[]
  viewMode: "grid" | "list"
  expandedOrgId: string | null
  onViewWorkspaces: (org: Organisation) => void
  onEditOrg: (org: Organisation) => void
  onAddUser: (org: Organisation) => void
  onSettings: (org: Organisation) => void
  onCreateWorkspace: (org: Organisation) => void
}

const LoadingCard = () => (
  <Card className="h-64 border-0 bg-card/90 backdrop-blur-sm">
    <CardContent className="p-6 h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
          <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-8 bg-muted rounded flex-1 animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const EmptyWorkspaceState = ({
  org,
  onCreateWorkspace,
}: { org: Organisation; onCreateWorkspace: (org: Organisation) => void }) => {
  const isCurrentUserAdmin = () => true // Mock admin check

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6 px-4 bg-muted/30 rounded-lg border-2 border-dashed border-border"
    >
      <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
      <h4 className="font-medium text-foreground mb-2">No workspaces yet</h4>
      <p className="text-sm text-muted-foreground mb-4">Get started by creating your first workspace</p>
      {isCurrentUserAdmin() && (
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onCreateWorkspace(org)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create First Workspace
        </Button>
      )}
    </motion.div>
  )
}

export function OrganizationDisplay({
  organisations,
  viewMode,
  expandedOrgId,
  onViewWorkspaces,
  onEditOrg,
  onAddUser,
  onSettings,
  onCreateWorkspace,
}: OrganizationDisplayProps) {

  const isCurrentUserAdmin = () => true // Mock admin check
  const workspaceQueries = useWorkspaceQueries(organisations)

  const isLoading = workspaceQueries.some(q => q.isLoading);

  if (isLoading) {
    return (
      <motion.div
        className="max-w-7xl mx-auto px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
      >
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.8 }}
    >
      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
        }
      >
        {organisations.map((org, index) => (
          <div key={org._id}>
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
            >
              <Link href={`/organisation/${org.slug}`} key={index}>
              <Card
                className={`group border-0 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${viewMode === "list" ? "flex flex-row h-32" : "min-h-64"
                  }`}
              >
                <CardContent className={`p-0 h-full ${viewMode === "list" ? "flex flex-row flex-1" : "flex flex-col"}`}>
                  {/* Content */}
                  <div className={viewMode === "list" ? "p-4 flex-1 flex items-center" : "p-4 flex-1"}>
                    <div className={viewMode === "list" ? "flex items-center space-x-4 flex-1" : ""}>
                      <motion.div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: org.color + "20" }}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        {org.image?.user ? (
                          <img
                            src={org.image.imageFullUrl}
                            alt={org.image.imageThumbUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: org.color }}
                          >
                            {org.title.charAt(0).toLocaleUpperCase()}
                          </div>
                        )}
                      </motion.div>

                      <div className={viewMode === "list" ? "flex-1" : "mb-3"}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-foreground font-serif line-clamp-1">{org.title}</h3>
                          {viewMode === "grid" && (
                            <Badge
                              className="text-xs px-2 py-1"
                              style={{
                                backgroundColor: org.color + "20",
                                color: org.color,
                                border: `1px solid ${org.color}40`,
                              }}
                            >
                              {org.User_role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{org.description}</p>

                        {viewMode === "grid" && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <FolderOpen className="w-3 h-3 mr-1" />
                              {org.workspace_count} workspaces
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(org.createdAt)}
                            </div>
                          </div>
                        )}
                      </div>

                      {viewMode === "list" && (
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <FolderOpen className="w-4 h-4 mr-1" />
                            {org.workspace_count}
                          </div>
                          <Badge
                            className="text-xs px-2 py-1"
                            style={{
                              backgroundColor: org.color + "20",
                              color: org.color,
                              border: `1px solid ${org.color}40`,
                            }}
                          >
                            {org.User_role}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {viewMode === "grid" && (
                    <div className="p-4 pt-0 space-y-2">
                      {/* Primary Action */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onViewWorkspaces(org)
                          }}
                        >
                          <FolderOpen className="w-4 h-4 mr-2" />
                          {Number.parseInt(org.workspace_count) > 0
                            ? `${expandedOrgId === org._id ? "Hide" : "View"} Workspaces (${org.workspace_count})`
                            : "View Workspaces"}
                          <ArrowRight
                            className={`w-4 h-4 ml-2 transition-transform ${expandedOrgId === org._id ? "rotate-90" : ""}`}
                          />
                        </Button>
                      </motion.div>

                      {/* Secondary Actions */}
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-card/50 border-border/50 hover:bg-card"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onEditOrg(org)
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-card/50 border-border/50 hover:bg-card"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onSettings(org)
                            }}
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Settings
                          </Button>
                        </motion.div>
                        {isCurrentUserAdmin() && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-card/50 border-border/50 hover:bg-card"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onAddUser(org)
                              }}
                            >
                              <UserPlus className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}

                  {viewMode === "list" && (
                    <div className="p-4 flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onViewWorkspaces(org)
                        }}
                      >
                        <FolderOpen className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onEditOrg(org)
                      }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onSettings(org)
                      }}>
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {viewMode === "grid" && (
                    <AnimatePresence>
                      {expandedOrgId === org._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-border bg-muted/30"
                        >
                          <div className="p-4">
                            {Number.parseInt(org.workspace_count) === 0 ? (
                              <EmptyWorkspaceState org={org} onCreateWorkspace={onCreateWorkspace} />
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {workspaceQueries[index]?.data
                                  .filter((workspace: Workspace) => workspace.organisation_id === org._id)
                                  .map((workspace: Workspace, index: number) => (
                                    <motion.div
                                      key={workspace._id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="bg-card/50 rounded-lg p-3 border border-border/30 hover:bg-card/70 transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-md flex items-center justify-center">
                                            <FolderOpen className="w-3 h-3 text-primary" />
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-foreground text-sm">{workspace.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                              {workspace.description}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                          <Users className="w-3 h-3" />
                                          <span>{workspace.members_count}</span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </CardContent>
              </Card>
              </Link>
            </motion.div>

            {viewMode === "list" && (
              <AnimatePresence>
                {expandedOrgId === org._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border/50 shadow-lg"
                  >
                    <div className="p-4">
                      {Number.parseInt(org.workspace_count) === 0 ? (
                        <EmptyWorkspaceState org={org} onCreateWorkspace={onCreateWorkspace} />
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {workspaceQueries[index].data
                            .filter((workspace: Workspace) => workspace.organisation_id === org._id)
                            .map((workspace: Workspace, index: number) => (
                              <motion.div
                                key={workspace._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card/50 rounded-lg p-3 border border-border/30 hover:bg-card/70 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-md flex items-center justify-center">
                                      <FolderOpen className="w-3 h-3 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-foreground text-sm">{workspace.title}</h4>
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {workspace.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Users className="w-3 h-3" />
                                    <span>{workspace.members_count}</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

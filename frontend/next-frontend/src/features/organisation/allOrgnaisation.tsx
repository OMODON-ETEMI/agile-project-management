"use client"

import { motion } from "framer-motion";
import { OrganizationListItem } from "./organisationList";
import { useState } from "react";
import { Organisation } from "@/src/helpers/type";
import { OrganisationGridItem } from "./oganisationGrid";
import { LayoutGrid, List } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrganizationsListProps {
  organizations: Organisation[];
  title?: string;
  className?: string;
}

export function OrganisationsList({
  organizations,
  title = "All Organizations",
  className = "",
}: OrganizationsListProps) {
  // Toggle between 'list' and 'grid'
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("p-4 sm:p-6 max-w-7xl mx-auto", className)}
    >
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
          </p>
        </div>
         {/* View Toggle Buttons */}
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "px-3 py-2 rounded-md transition-colors",
              view === "list" && "bg-background shadow-sm"
            )}
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "px-3 py-2 rounded-md transition-colors",
              view === "grid" && "bg-background shadow-sm"
            )}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>
      <div className="mt-6">
        {view === "list" ? (
        <div className="space-y-2 sm:space-y-3">
          {organizations.map((org, index) => (
            <motion.div
              key={org._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <OrganizationListItem organisation={org} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {organizations.map((org, index) => (
            <motion.div
              key={org._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.07 }}
            >
              <OrganisationGridItem organisation={org} />
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </motion.section>
  );
}
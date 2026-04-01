"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Grid, List } from "lucide-react"

interface SearchFilterSectionProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function SearchFilterSection({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: SearchFilterSectionProps) {
  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.4 }}
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <motion.div className="relative flex-1 max-w-md" whileHover={{ scale: 1.02 }}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search organizations..."
            className="pl-12 h-12 bg-card/90 backdrop-blur-sm border-border"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </motion.div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1">
            <motion.button
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onViewModeChange("grid")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid className="w-4 h-4" />
            </motion.button>
            <motion.button
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onViewModeChange("list")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="lg" className="h-12 px-6 bg-card/90 backdrop-blur-sm border-border">
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

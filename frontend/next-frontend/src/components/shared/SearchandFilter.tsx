import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, List, Grid } from "lucide-react"

interface SearchAndFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function SearchAndFilter({ searchQuery, onSearchChange, viewMode, onViewModeChange }: SearchAndFilterProps) {
  return (
    <motion.div
      className="relative "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col mb-6 sm:flex-row justify-items-center justify-between w-full items-stretch sm:items-center px-6">
        <motion.div className="relative flex-1 w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl" whileHover={{ scale: 1.02 }}>
          <Search className="absolute left-2 z-10 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            placeholder="Search organizations..."
            className="pl-10 sm:pl-12 h-10 sm:h-11 md:h-12 lg:h-13 w-full bg-card/90 backdrop-blur-sm border-border text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </motion.div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1">
            <motion.button
              className={`p-2 rounded-md transition-colors ${viewMode === "grid"
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
              className={`p-2 rounded-md transition-colors ${viewMode === "list"
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
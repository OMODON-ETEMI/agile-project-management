"use client"

import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"

interface NotificationFiltersProps {
  selectedTypes: string[];
  onToggleType: (type: string) => void;
}

export function NotificationFilters({ selectedTypes, onToggleType }: NotificationFiltersProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-64 z-50">
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={selectedTypes.includes("mention")}
          onCheckedChange={() => onToggleType("mention")}
        >
          Show mentions
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={selectedTypes.includes("comment")}
          onCheckedChange={() => onToggleType("comment")}
        >
          Show comments
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={selectedTypes.includes("task_assigned")}
          onCheckedChange={() => onToggleType("task_assigned")}
        >
          Show tasks
        </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
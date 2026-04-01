"use client"

import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface CreateOrgDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateOrgDialog({ open, onOpenChange }: CreateOrgDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground font-serif">
            Create New Organization
          </DialogTitle>
        </DialogHeader>

        <motion.div
          className="space-y-8 py-4 max-h-[70vh] overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-sm font-medium text-muted-foreground">
              Organization Name
            </Label>
            <Input id="org-name" placeholder="Enter organization name" className="h-12 bg-card/50 border-border" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="org-description" className="text-sm font-medium text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="org-description"
              placeholder="Describe your organization"
              className="min-h-[100px] bg-card/50 border-border"
            />
          </div>

          {/* Brand Colors */}
          <div className="space-y-2">
            <Label htmlFor="org-color" className="text-sm font-medium text-muted-foreground">
              Brand Color
            </Label>
            <div className="flex space-x-2">
              {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"].map((color) => (
                <motion.button
                  key={color}
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                  style={{ backgroundColor: color }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Organization Logo</Label>
            <motion.div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload logo</p>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
                onClick={() => onOpenChange(false)}
              >
                Create Organization
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="h-12 px-6 bg-transparent border-border"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

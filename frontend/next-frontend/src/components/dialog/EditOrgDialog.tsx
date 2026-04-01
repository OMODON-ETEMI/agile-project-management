"use client"

import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Organisation } from "@/src/helpers/type"

interface CreateOrgDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedOrg: Organisation | null
}

export default function EditOrgDialog({ open, onOpenChange, selectedOrg }: CreateOrgDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground font-serif">Edit Organization</DialogTitle>
                </DialogHeader>
                <motion.div
                    className="space-y-8 py-4 max-h-[70vh] overflow-y-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-2">
                        <Label htmlFor="edit-org-name" className="text-sm font-medium text-muted-foreground">
                            Organization Name
                        </Label>
                        <Input id="edit-org-name" defaultValue={selectedOrg?.title} className="h-12 bg-card/50 border-border" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-org-description" className="text-sm font-medium text-muted-foreground">
                            Description
                        </Label>
                        <Textarea
                            id="edit-org-description"
                            defaultValue={selectedOrg?.description}
                            className="min-h-[100px] bg-card/50 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-manager" className="text-sm font-medium text-muted-foreground">
                            Manager Email
                        </Label>
                        <Input
                            id="edit-manager"
                            type="email"
                            defaultValue={selectedOrg?.manager}
                            placeholder="manager@company.com"
                            className="h-12 bg-card/50 border-border"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
                                onClick={() => onOpenChange(false)}
                            >
                                Save Changes
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

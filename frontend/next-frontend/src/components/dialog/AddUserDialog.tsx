"use client"

import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Organisation } from "@/src/helpers/type"
import { Mail } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateOrgDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedOrg: Organisation | null
}

export default function AddUserDialog({ open, onOpenChange, selectedOrg }: CreateOrgDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground font-serif">
                        Add User to {selectedOrg?.title}
                    </DialogTitle>
                </DialogHeader>
                <motion.div
                    className="space-y-8 py-4 max-h-[70vh] overflow-y-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-2">
                        <Label htmlFor="user-email" className="text-sm font-medium text-muted-foreground">
                            Email Address
                        </Label>
                        <Input
                            id="user-email"
                            type="email"
                            placeholder="user@company.com"
                            className="h-12 bg-card/50 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user-role" className="text-sm font-medium text-muted-foreground">
                            Role
                        </Label>
                        <Select>
                            <SelectTrigger className="h-12 bg-card/50 border-border">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="invitation-message" className="text-sm font-medium text-muted-foreground">
                            Invitation Message (Optional)
                        </Label>
                        <Textarea
                            id="invitation-message"
                            placeholder="Welcome to our organization!"
                            className="min-h-[80px] bg-card/50 border-border"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
                                onClick={() => onOpenChange(false)}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Send Invitation
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

"use client"

import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Organisation } from "@/src/helpers/type"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateOrgDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedOrg: Organisation | null
}

export default function SettingOrgDialog({ open, onOpenChange, selectedOrg }: CreateOrgDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground font-serif">Organization Settings</DialogTitle>
                </DialogHeader>
                <motion.div
                    className="space-y-8 py-4 max-h-[70vh] overflow-y-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* General Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">General</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Organization URL</Label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                                        yourapp.com/
                                    </span>
                                    <Input defaultValue={selectedOrg?.slug} className="rounded-l-none bg-card/50 border-border" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <h4 className="font-medium text-foreground">Workspace Creation</h4>
                                    <p className="text-sm text-muted-foreground">Who can create new workspaces</p>
                                </div>
                                <Select defaultValue="admin">
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin Only</SelectItem>
                                        <SelectItem value="editor">Admin & Editor</SelectItem>
                                        <SelectItem value="all">All Members</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <h4 className="font-medium text-foreground">User Invitations</h4>
                                    <p className="text-sm text-muted-foreground">Who can invite new users</p>
                                </div>
                                <Select defaultValue="admin">
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin Only</SelectItem>
                                        <SelectItem value="editor">Admin & Editor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-red-900 dark:text-red-100">Delete Organization</h4>
                                    <p className="text-sm text-red-700 dark:text-red-300">This action cannot be undone</p>
                                </div>
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
                                onClick={() => onOpenChange(false)}
                            >
                                Save Settings
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

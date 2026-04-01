"use client"

import { motion } from "framer-motion"
import Button from "@/src/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Mail, Search, Loader2, Check, UserCheck, UserPlus, AlertCircle, UserX, Info } from "lucide-react"
import { ROLES, Organisation, User } from "@/src/helpers/type"
import { use, useState } from "react"
import { useCreateOrganisation, useDeleteOrganisation, useOrganisationMembers, userSearch, useUpdateOrganisation, useUserRoleUpdateOrganisation, useUserUpdateOrganisation } from "@/src/lib/api/reactQuery"

interface OrganizationModalsProps {
  isCreateOrgModalOpen: boolean
  setIsCreateOrgModalOpen: (open: boolean) => void
  isEditOrgModalOpen: boolean
  setIsEditOrgModalOpen: (open: boolean) => void
  isAddUserModalOpen: boolean
  setIsAddUserModalOpen: (open: boolean) => void
  isSettingsModalOpen: boolean
  setIsSettingsModalOpen: (open: boolean) => void
  selectedOrg: Organisation | null
}

export function OrganizationModals({
  isCreateOrgModalOpen,
  setIsCreateOrgModalOpen,
  isEditOrgModalOpen,
  setIsEditOrgModalOpen,
  isAddUserModalOpen,
  setIsAddUserModalOpen,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  selectedOrg,
}: OrganizationModalsProps) {
  const [formData, setFormData] = useState<Partial<Organisation>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logoSearchQuery, setLogoSearchQuery] = useState("")
  const [isSearchingLogos, setIsSearchingLogos] = useState(false)
  const [logoResults, setLogoResults] = useState<any[]>([])
  const [selectedLogo, setSelectedLogo] = useState<any | null>(null)
  const [showLogoSearch, setShowLogoSearch] = useState(false)
  const [open, setOpen] = useState(false)

  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<User[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [invitationMessage, setInvitationMessage] = useState("")
  const [showEmailInvite, setShowEmailInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")


  const { data: organizationMembers } = useOrganisationMembers(selectedOrg?._id)
  const { data: searchOrganizationMembers, isLoading: isSearching } = userSearch(selectedOrg?._id || "", userSearchQuery)

  const createOrg = useCreateOrganisation()

  const deleteOrg = useDeleteOrganisation(() => setIsSettingsModalOpen(false))

  const updateOrg = useUpdateOrganisation()

  const editUser = useUserUpdateOrganisation()

  const editRole = useUserRoleUpdateOrganisation()

  // const searchUser = async () => {
  //   try {
  //     setIsSearchingUsers(true)
  //     if (searchOrganizationMembers){
  //         setUserSearchResults(searchOrganizationMembers)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching users:", error)
  //   } finally {
  //     setIsSearchingUsers(false)
  //     setHasSearched(true)
  //   }
  // }

  const searchLogo = async (query: string) => {
    if (!query.trim()) return;
    try {
      setIsSearchingLogos(true)
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6`, {
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
        }
      })
      const data = await res.json()
      setLogoResults(data.results)
    } catch (error) {
      console.error("Error fetching logos:", error)
    } finally {
      setIsSearchingLogos(false)
    }
  }

  const handleConfirm = async () => {
    try {
      const res = await fetch(`https://api.unsplash.com/photos/random`, {
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
        }
      })
      const data = await res.json()
      setSelectedLogo(data)
    } catch (error) {
      console.error("Error fetching random logo:", error)
    } finally {
      setOpen(false)
    }
  }

  const handleInputChange = (field: keyof Organisation, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateAddUser = () => {
    const newErrors: Record<string, string> = {}
    if (!selectedUser) {
      newErrors.user = "Please search and select a user"
    }
    if (!selectedRole) {
      newErrors.role = "Please select a role - roles are required"
    }
    if (showEmailInvite) {
      if (!inviteEmail || !inviteEmail.trim()) {
        newErrors.inviteEmail = "Email address is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
        newErrors.inviteEmail = "Please enter a valid email address"
      }
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0 && selectedUser && selectedOrg) {
      const type = "invite"
      editUser.mutate({
        formData: {
          user_id: selectedUser.user_id,
          org_id: selectedOrg._id,
          role: selectedRole,
        }, type
      })
      setIsAddUserModalOpen(false)
      setErrors({})
      return true
    }
  }

  const handleSubmit = async (action: string) => {
    const newErrors: Record<string, string> = {}
    console.log("handle submit button was clicked")
    if (action === "create") {
      if (!formData.title || formData.title.trim().length < 2) {
        newErrors.title = "Organization name must be at least 2 characters"
      }
      if (!formData.description || formData.description.trim().length < 10) {
        newErrors.description = "Description must be at least 10 characters"
      }
      if (!formData.color) {
        newErrors.color = "Please select a brand color"
      }
      setErrors(newErrors)
      if (Object.keys(newErrors).length === 0) {
        createOrg.mutate(formData)
        setFormData({})
        setIsCreateOrgModalOpen(false)
        setErrors({})
      }
    }
    else if (action === "edit" && selectedOrg) {
      console.log("edit button was clicked")
      console.log("formData in edit:", formData)
      if (formData.title && formData.title.trim().length < 2) {
        newErrors.title = "Organization name must be at least 2 characters"
      }
      if (formData.description && formData.description.trim().length < 10) {
        newErrors.description = "Description must be at least 10 characters"
      }
      if (formData.slug && formData.slug.trim().length < 2) {
        newErrors.slug = "Organization slug must be at least 2 characters"
      }
      
      const hasChanges = 
        (formData.title && formData.title !== selectedOrg.title) ||
        (formData.description && formData.description !== selectedOrg.description) ||
        (formData.slug && formData.slug !== selectedOrg.slug) ||
        (formData.color && formData.color !== selectedOrg.color) ||
        (selectedLogo && selectedLogo.urls !== selectedOrg.image?.urls)
      
      if (!hasChanges) {
        setIsEditOrgModalOpen(false)
        return
      }
      setErrors(newErrors)
      if (Object.keys(newErrors).length === 0) {
        setErrors({})
        formData._id = selectedOrg._id
        formData.type = "organisation"
        updateOrg.mutate(formData)
        setFormData({})
        setIsEditOrgModalOpen(false)
      }
    }
  }
  return (
    <>
      {/* Create Organization Modal */}
      <Dialog open={isCreateOrgModalOpen} onOpenChange={setIsCreateOrgModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-sm border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground font-serif">Create New Organization</DialogTitle>
          </DialogHeader>
          <motion.div
            className="space-y-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="org-title" className="text-sm font-medium text-muted-foreground">
                Organization Title
              </Label>
              <Input id="org-title" placeholder="Enter organization Title" className={`h-12 bg-card/50 border-border ${errors.title ? "border-red-500" : ""}`} onChange={(e) => handleInputChange("title", e.target.value)} />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description" className="text-sm font-medium text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="org-description"
                placeholder="Describe your organization"
                className="min-h-[100px] bg-card/50 border-border"
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-color" className="text-sm font-medium text-muted-foreground">
                Brand Color
              </Label>
              <div className="flex space-x-2">
                {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"].map((color) => (
                  <motion.button
                    key={color}
                    className={`w-10 h-10 rounded-lg border-2 border-white shadow-md ${formData.color === color ? "ring-4 ring-offset-2 ring-primary" : "hover:ring-2 hover:ring-offset-1 hover:ring-primary/50"}`}
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleInputChange("color", color)}
                  />
                ))}
              </div>
              {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium text-muted-foreground">Organization Logo</Label>

              {!showLogoSearch ? (
                <div className="space-y-3">
                  {selectedLogo ? (
                    <motion.div
                      className="relative border-2 border-primary rounded-lg p-4 bg-primary/5"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={selectedLogo.urls.thumb}
                          alt="Selected logo"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Logo Selected</p>
                          <p className="text-sm text-muted-foreground">By {selectedLogo.user.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLogo(null)
                              setShowLogoSearch(true)
                            }}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <motion.div
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setShowLogoSearch(true)}
                      >
                        <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Search for logo</p>
                      </motion.div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">or</span>
                        </div>
                      </div>

                      <motion.div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => (setOpen(true))}
                      >
                        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload your own logo</p>
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Search for logos (e.g., tech, business, creative)"
                        value={logoSearchQuery}
                        onChange={(e) => setLogoSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            searchLogo(logoSearchQuery)
                          }
                        }}
                        className="h-12 bg-card/50 border-border pr-12"
                      />
                      {isSearchingLogos && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => searchLogo(logoSearchQuery)}
                      disabled={isSearchingLogos || !logoSearchQuery.trim()}
                      className="h-12 px-6"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  {logoResults.length > 0 && (
                    <motion.div
                      className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {logoResults.map((image) => (
                        <motion.div
                          key={image.Id}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedLogo?.Id === image.id
                            ? "border-primary shadow-lg"
                            : "border-transparent hover:border-border"
                            }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedLogo(image)
                            setShowLogoSearch(false)
                          }}
                        >
                          <img
                            src={image.urls.small}
                            alt={`Logo by ${image.user.name}`}
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1">
                            <p className="text-xs truncate">By {image.user.name}</p>
                          </div>
                          {selectedLogo?.id === image.id && (
                            <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowLogoSearch(false)
                        setLogoResults([])
                        setLogoSearchQuery("")
                      }}
                    >
                      Back
                    </Button>
                    {selectedLogo && (
                      <Button type="button" onClick={() => setShowLogoSearch(false)}>
                        Use Selected Logo
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
                  onClick={() => handleSubmit('create')}
                >
                  Create Organization
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setFormData({})
                    setIsCreateOrgModalOpen(false)
                  }}
                >
                  Cancel
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[400px] text-center space-y-4">
            <div className="text-3xl">💸</div>
            <h3 className="text-lg font-semibold">
              Nice try! But storage costs money 😅
            </h3>
            <p className="text-sm text-muted-foreground">
              Do you really think I can pay for a bucket just to store random images?
              Let’s pretend your upload worked — recruiters, trust me, I got this 😉
            </p>
            <Button onClick={handleConfirm}>Haha okay, fake it ❤️</Button>
          </DialogContent>
        </Dialog>
      </Dialog>

      {/* Edit Organization Modal */}
      <Dialog open={isEditOrgModalOpen} onOpenChange={(open) => {
        setIsEditOrgModalOpen(open)
        if (open) {
          setSelectedLogo(selectedOrg?.image)
        }
      }} >
        <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-sm border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground font-serif">Edit Organization</DialogTitle>
          </DialogHeader>
          <motion.div
            className="space-y-8 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit('edit')
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="edit-org-title" className="text-sm font-medium text-muted-foreground">
                  Organization Title
                </Label>
                <Input
                  id="edit-org-title"
                  defaultValue={selectedOrg?.title}
                  className={`h-12 bg-card/50 border-border ${errors.title ? "border-red-500" : ""}`}
                  onChange={(e) => handleInputChange("title", e.target.value)} />
                {errors.title && (<p className="text-sm text-red-500">{errors.title}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-org-description" className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="edit-org-description"
                  defaultValue={selectedOrg?.description}
                  className={`min-h-[100px] bg-card/50 border-border ${errors.description ? "border-red-500" : ""}`}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
                {errors.description && (<p className="text-sm text-red-500">{errors.description}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-org-slug" className="text-sm font-medium text-muted-foreground">
                  Organization Slug
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                    yourapp.com/
                  </span>
                  <Input
                    id="edit-org-slug"
                    name="edit-org-slug"
                    defaultValue={selectedOrg?.slug}
                    className="rounded-l-none bg-card/50 border-border"
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                  />
                  {errors.slug && (<p className="text-sm text-red-500">{errors.slug}</p>)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Brand Color</Label>
                <div className="flex space-x-2">
                  {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"].map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-lg border-2 shadow-md ${selectedOrg?.color === color ? "border-white ring-2 ring-primary" : "border-white"} ${formData.color === color ? "ring-4 ring-offset-2 ring-primary" : "hover:ring-2 hover:ring-offset-1 hover:ring-primary/50"}`}
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleInputChange("color", color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">Organization Logo</Label>

                {!showLogoSearch ? (
                  <div className="space-y-3">
                    {selectedLogo ? (
                      <motion.div
                        className="relative border-2 border-primary rounded-lg p-4 bg-primary/5"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={selectedLogo.urls.thumb}
                            alt="Selected logo"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">Logo Selected</p>
                            <p className="text-sm text-muted-foreground">By {selectedLogo.user.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Check className="w-5 h-5 text-green-500" />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLogo(null)
                                setShowLogoSearch(true)
                              }}
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        <motion.div
                          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setShowLogoSearch(true)}
                        >
                          <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Search for logo</p>
                        </motion.div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or</span>
                          </div>
                        </div>

                        <motion.div
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => (setOpen(true))}
                        >
                          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Upload your own logo</p>
                        </motion.div>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Search for logos (e.g., tech, business, creative)"
                          value={logoSearchQuery}
                          onChange={(e) => setLogoSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              searchLogo(logoSearchQuery)
                            }
                          }}
                          className="h-12 bg-card/50 border-border pr-12"
                        />
                        {isSearchingLogos && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={() => searchLogo(logoSearchQuery)}
                        disabled={isSearchingLogos || !logoSearchQuery.trim()}
                        className="h-12 px-6"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>

                    {logoResults.length > 0 && (
                      <motion.div
                        className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {logoResults.map((image) => (
                          <motion.div
                            key={image.Id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedLogo?.Id === image.id
                              ? "border-primary shadow-lg"
                              : "border-transparent hover:border-border"
                              }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedLogo(image)
                              setShowLogoSearch(false)
                            }}
                          >
                            <img
                              src={image.urls.small}
                              alt={`Logo by ${image.user.name}`}
                              className="w-full h-20 object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1">
                              <p className="text-xs truncate">By {image.user.name}</p>
                            </div>
                            {selectedLogo?.id === image.id && (
                              <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowLogoSearch(false)
                          setLogoResults([])
                          setLogoSearchQuery("")
                        }}
                      >
                        Back
                      </Button>
                      {selectedLogo && (
                        <Button type="button" onClick={() => setShowLogoSearch(false)}>
                          Use Selected Logo
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </form>
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground">Member Roles</h3>
              <div className="space-y-3">
                {organizationMembers?.map((member) => (
                  <motion.div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.image?.imageFullUrl || "/placeholder.svg"}
                        alt={member.image?.imageUserName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{member.username}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        defaultValue={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        onValueChange={(newRole) => {
                          editRole.mutate({
                            user_id: member.user_id,
                            org_id: selectedOrg?._id || "",
                            role: newRole,
                          })
                        }}>
                        <SelectTrigger className="w-32 h-9 bg-card/20 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['Admin', 'Member'].map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          editUser.mutate({
                            formData: {
                              user_id: member.user_id,
                              org_id: selectedOrg?._id || ""
                            }, type: 'remove'
                          })
                        }}>
                        Remove
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
                  onClick={() => handleSubmit('edit')}
                >
                  Save Changes
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setFormData({})
                    setIsEditOrgModalOpen(false)
                  }}
                >
                  Cancel
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] bg-card/95 backdrop-blur-sm border-0 shadow-2xl flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-foreground font-serif">
              Add User to {selectedOrg?.title}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <motion.div
            className="space-y-4 py-3 overflow-y-auto flex-1 pr-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Toggle between Search and Invite by Email */}
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Button
                type="button"
                variant={!showEmailInvite ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setShowEmailInvite(false)
                  setInviteEmail("")
                  setErrors({})
                }}
                className="flex-1 h-8 text-xs"
              >
                <Search className="w-3 h-3 mr-1.5" />
                Search Users
              </Button>
              <Button
                type="button"
                variant={showEmailInvite ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setShowEmailInvite(true)
                  setSelectedUser(null)
                  setUserSearchResults([])
                  setUserSearchQuery("")
                  setErrors({})
                }}
                className="flex-1 h-8 text-xs"
              >
                <Mail className="w-3 h-3 mr-1.5" />
                Invite by Email
              </Button>
            </div>

            {/* Search User Section */}
            {!showEmailInvite ? (
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Search for User</Label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Search by email or name..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || userSearchQuery.length > 1) {
                          if(searchOrganizationMembers){
                            console.log('Organisation Members: ', searchOrganizationMembers)
                            setUserSearchResults(searchOrganizationMembers)
                          }
                        }
                      }}
                      className={`h-9 text-sm bg-card/50 border-border pr-10 ${errors.user ? "border-red-500" : ""}`}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => { 
                      setUserSearchQuery(userSearchQuery)
                      if(userSearchQuery.length > 1){
                        setHasSearched(true)
                      }
                    }}
                    disabled={isSearching || !userSearchQuery.trim()}
                    className="h-9 px-4 text-sm"
                  >
                    <Search className="w-3.5 h-3.5 mr-1.5" />
                    Search
                  </Button>
                </div>
                {errors.user && <p className="text-xs text-red-500">{errors.user}</p>}

                {/* No Results Found - Suggest Email Invite */}
                {hasSearched && userSearchQuery && !isSearching && userSearchResults.length === 0 && (
                  <motion.div
                    className="p-4 border border-dashed border-border rounded-lg bg-muted/20 text-center space-y-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <UserX className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">No users found</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Try searching with a different term or invite by email
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowEmailInvite(true)
                        setInviteEmail(userSearchQuery.includes('@') ? userSearchQuery : '')
                      }}
                      className="h-8 text-xs"
                    >
                      <Mail className="w-3 h-3 mr-1.5" />
                      Invite by Email Instead
                    </Button>
                  </motion.div>
                )}

                {/* Search Results */}
                {userSearchResults.length > 0 && (
                  <motion.div
                    className="space-y-1.5 max-h-56 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {userSearchResults.map((user) => (
                      <motion.div
                        key={user.user_id}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${selectedUser?.user_id === user.user_id
                          ? "bg-primary/10 border-2 border-primary"
                          : user.isMember
                            ? "bg-muted/50 border border-muted cursor-not-allowed opacity-60"
                            : "bg-card hover:bg-muted/30 border border-transparent hover:border-border"
                          }`}
                        whileHover={!user.isMember ? { scale: 1.01 } : {}}
                        onClick={() => {
                          if (!user.isMember) {
                            setSelectedUser(user)
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={user.image.imageFullUrl || "/placeholder.svg"}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm text-foreground">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user.isMember ? (
                            <div className="flex items-center space-x-1.5 text-muted-foreground">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span className="text-xs">Already added</span>
                            </div>
                          ) : selectedUser?.user_id === user.user_id ? (
                            <div className="flex items-center space-x-1.5 text-primary">
                              <Check className="w-3.5 h-3.5" />
                              <span className="text-xs">Selected</span>
                            </div>
                          ) : (
                            <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              /* Email Invite Section */
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className={`h-9 text-sm bg-card/50 border-border pl-10 ${errors.inviteEmail ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.inviteEmail && <p className="text-xs text-red-500">{errors.inviteEmail}</p>}
                  <p className="text-xs text-muted-foreground flex items-start space-x-1.5">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>An invitation email will be sent to this address. The user can sign up and join your organization.</span>
                  </p>
                </div>

                {/* Preview Card */}
                {inviteEmail && inviteEmail.includes('@') && !errors.inviteEmail && (
                  <motion.div
                    className="p-3 border border-border rounded-lg bg-muted/20 space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">Invitation Preview</p>
                        <p className="text-xs text-muted-foreground">{inviteEmail}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Role Selection - Required (Shows for both search and email invite) */}
            {((selectedUser && !selectedUser.isMember) || (showEmailInvite && inviteEmail)) && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Label className="text-xs font-medium text-muted-foreground">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger
                    className={`h-9 text-sm bg-card/50 border-border ${errors.role ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select a role (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="text-sm">Admin - Full access</SelectItem>
                    <SelectItem value="editor" className="text-sm">Editor - Edit content</SelectItem>
                    <SelectItem value="viewer" className="text-sm">Viewer - Read-only</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <div className="flex items-center space-x-1.5 text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <p className="text-xs">{errors.role}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Invitation Message */}
            {((selectedUser && !selectedUser.isMember) || (showEmailInvite && inviteEmail)) && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Label className="text-xs font-medium text-muted-foreground">Invitation Message (Optional)</Label>
                <Textarea
                  placeholder="Welcome to our organization! We're excited to have you on the team."
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  className="min-h-[70px] text-sm bg-card/50 border-border resize-none"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex space-x-2 pt-3 border-t border-border flex-shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                onClick={() => {
                  if (validateAddUser()) {
                    if (showEmailInvite) {
                      console.log("Sending email invitation to:", inviteEmail, "with role:", selectedRole)
                      // Handle email invitation logic here
                    } else {
                      console.log("Inviting user:", selectedUser, "with role:", selectedRole)
                    }
                    setIsAddUserModalOpen(false)
                    // Reset form
                    setSelectedUser(null)
                    setSelectedRole("")
                    setInvitationMessage("")
                    setUserSearchQuery("")
                    setUserSearchResults([])
                    setShowEmailInvite(false)
                    setHasSearched(false)
                    setInviteEmail("")
                  }
                }}
                disabled={
                  showEmailInvite
                    ? (!inviteEmail || !selectedRole)
                    : (!selectedUser || selectedUser.isMember || !selectedRole)
                }
                className="w-full h-9 text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                {showEmailInvite
                  ? (inviteEmail && selectedRole ? "Send Email Invitation" : "Enter Email & Role")
                  : (selectedUser && !selectedUser.isMember ? "Send Invitation" : "Select User & Role")
                }
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsAddUserModalOpen(false)
                  // Reset form
                  setSelectedUser(null)
                  setSelectedRole("")
                  setInvitationMessage("")
                  setUserSearchQuery("")
                  setUserSearchResults([])
                  setShowEmailInvite(false)
                  setInviteEmail("")
                }}
              >
                Cancel
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
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
                    <Input defaultValue={selectedOrg?.slug} className="rounded-l-none bg-card/50 border-border" onChange={(e) => handleInputChange('slug', e.target.value)} />
                  </div>
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
                  <Button variant="destructive" size="sm" onClick={() => deleteOrg.mutate(selectedOrg?._id || "")} disabled={!selectedOrg}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  className="w-full h-10 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
                  onClick={() => {
                    handleSubmit('edit')
                    setIsSettingsModalOpen(false)
                  }}
                >
                  Save Settings
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsSettingsModalOpen(false)}
                >
                  Cancel
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}

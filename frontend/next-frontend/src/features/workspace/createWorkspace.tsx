'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from '@/src/Authentication/authcontext'
import { Organisation } from '@/src/helpers/type'
import { handleAxiosError } from '@/src/helpers/response-handler'
import { useRouter } from 'next/navigation'
import Button from '@/src/components/ui/button'
import { useWorkspaceMutations } from '@/src/hooks/useWorkspace'

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Workspace name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  image: z.string().optional(),
})

interface CreateWorkspaceModalProps {
    organisation: Organisation
}

export function CreateWorkspaceModal({organisation}: CreateWorkspaceModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()
  const { createWorkspace } = useWorkspaceMutations()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser?.user_id || !organisation) {
      handleAxiosError("User ID or Ogranisation ID is missing. Cannot submit form")
    }
    const submissionData = {
      ...values,
      user_id: currentUser?.user_id,
      organisation_id: organisation._id
    }
    try {
      setLoading(true)
      createWorkspace(submissionData)
      setOpen(false)
      form.reset()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="inline-block cursor-pointer">
          <Button className="bg-indigo-500 hover:bg-indigo-600 rounded-sm">
            <span className='flex items-center'>
              <Plus size={12} className='mr-2'/>
              <span>Workspace</span>
            </span>
          </Button>
        </span>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="title">Workspace Name</Label>
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="title"
                        className="mt-1"
                        disabled={loading}
                      />
                    )}
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="description">Description</Label>
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        className="mt-1"
                        disabled={loading}
                      />
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="image">Image URL (Optional)</Label>
                  <Controller
                    name="image"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="image"
                        type="url"
                        className="mt-1"
                        disabled={loading}
                      />
                    )}
                  />
                </motion.div>
              </div>

              <motion.div 
                className="flex justify-end space-x-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="button"
                  variant="empty"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Workspace"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
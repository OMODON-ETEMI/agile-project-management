'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { createOrganisation } from '@/src/lib/api/organisation'
import Button from '@/src/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  image: z.string().optional(),
})

export function CreateOrganizationModal({ definedUI }: { definedUI?: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  })


  const createOrganisationClient = useMutation({
    mutationFn: (form: z.infer<typeof formSchema>) => createOrganisation(form),
    onSuccess: () => {
      form.reset()
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['allOrganisations'] });
    }
  })


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="inline-block h-full cursor-pointer">
          {definedUI ? definedUI :
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 rounded-sm h-full">
              <span className='flex flex-row items-center'>
                <Plus size={12} className='mr-2' />
                <span>New Org</span>
              </span>
            </Button>}
        </span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit((data) => createOrganisationClient.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="title">Organization Name</Label>
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="title"
                      className="mt-1"
                      disabled={createOrganisationClient.isPending}
                    />
                  )}
                />
                {form.formState.errors.title && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{form.formState.errors.title.message}</p>
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
                      disabled={createOrganisationClient.isPending}
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
                      disabled={createOrganisationClient.isPending}
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
                disabled={createOrganisationClient.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                disabled={createOrganisationClient.isPending}
              >
                {createOrganisationClient.isPending ? "Creating..." : "Create Organization"}
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
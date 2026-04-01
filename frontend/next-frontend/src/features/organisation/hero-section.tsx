"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Settings, ArrowRight, Building2, FolderOpen, Users } from "lucide-react"
import React from "react"

interface HeroSectionProps {
  onCreateOrg: () => void
}

export function HeroSection({ onCreateOrg }: HeroSectionProps) {
  const highlights = [
    { icon: Building2, text: "Organizations" },
    { icon: FolderOpen, text: "Workspaces" },
    { icon: Users, text: "Team Members" },
  ]

  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 text-center mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="flex items-center justify-center space-x-6 mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {highlights.map((item, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground mb-4"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              {React.createElement(item.icon, { className: "w-6 h-6" })}
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium">{item.text}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.h1
        className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-serif"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Organizations
        <motion.span
          className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-2xl md:text-3xl mt-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Manage Your Teams & Workspaces
        </motion.span>
        <motion.p
          className="text-lg text-muted-foreground max-w-2xl justify-self-center mx-auto mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Streamline collaboration and boost productivity with powerful organization management tools
        </motion.p>
      </motion.h1>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="lg"
            className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 border-0 shadow-lg transition-all duration-300"
            onClick={onCreateOrg}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Organization
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" variant="outline" className="h-12 px-6 border-2 border-border bg-card/50 backdrop-blur-sm">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="lg"
            className="h-12 px-6 bg-gradient-to-r from-accent to-primary hover:opacity-90 border-0 shadow-lg transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Start Free Trial
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

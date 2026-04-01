"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Activity, Users } from "lucide-react"
import type { Organisation } from "@/app/organization/page"

interface StatsSectionProps {
  organizations: Organisation[]
}

export function StatsSection({ organizations }: StatsSectionProps) {
  const stats = [
    {
      label: "Total Organizations",
      value: organizations.length.toString(),
      change: "+3",
      icon: Building2,
      color: "blue",
    },
    {
      label: "Total Workspaces",
      value: organizations.reduce((sum, org) => sum + Number.parseInt(org.workspace_count), 0).toString(),
      change: "+12",
      icon: Activity,
      color: "violet",
    },
    { label: "Active Admins", value: organizations.length.toString(), change: "+2", icon: Users, color: "blue" },
  ]

  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              whileHover={{ y: -8, rotateY: 5 }}
            >
              <Card className="group border-0 bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {IconComponent && <IconComponent className="w-6 h-6" />}
                    </motion.div>
                    <Badge variant="secondary" className="text-green-600 bg-green-50 dark:bg-green-950/50">
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

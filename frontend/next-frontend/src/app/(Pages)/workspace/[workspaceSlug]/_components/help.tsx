
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  BookOpen,
  MessageCircle,
  FileText,
  HelpCircle,
  Rocket,
  Users,
  Settings,
  Bell,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const popularTopics = [
    { icon: Rocket, title: "Getting Started", count: 12 },
    { icon: Users, title: "Team Collaboration", count: 8 },
    { icon: Settings, title: "Settings & Preferences", count: 15 },
    { icon: Bell, title: "Notifications", count: 6 },
    { icon: Shield, title: "Security & Privacy", count: 10 },
    { icon: Zap, title: "Integrations", count: 7 },
  ]

  const articles = [
    {
      category: "Getting Started",
      title: "How to create your first workspace",
      description: "Learn the basics of setting up your workspace and inviting team members",
      readTime: "3 min read",
    },
    {
      category: "Features",
      title: "Understanding Kanban boards",
      description: "Master the drag-and-drop interface for managing issues and sprints",
      readTime: "5 min read",
    },
    {
      category: "Collaboration",
      title: "Using real-time notifications",
      description: "Stay updated with mentions, assignments, and activity across workspaces",
      readTime: "4 min read",
    },
    {
      category: "Advanced",
      title: "Sprint metrics and reporting",
      description: "Track burndown, velocity, and team performance with built-in analytics",
      readTime: "7 min read",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">How can we help you?</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Search our knowledge base or browse categories below
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for articles, guides, or FAQs..."
              className="pl-12 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Popular Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic, i) => {
              const Icon = topic.icon
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{topic.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {topic.count} articles
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Featured Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="space-y-4">
            {articles.map((article, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{article.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {article.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Still need help?
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <p className="font-medium">Live Chat</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Chat with our support team in real-time
                  </p>
                  <button className="text-sm text-primary hover:underline">
                    Start a conversation →
                  </button>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <p className="font-medium">Documentation</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive guides and API reference
                  </p>
                  <button className="text-sm text-primary hover:underline">
                    View documentation →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Play,
  Github,
  Linkedin,
  Code2,
  Database,
  Zap,
  Shield,
  Users,
  BarChart3,
  Bell,
  Layout,
  Server,
  Cloud,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-violet-50 to-background dark:from-blue-950/20 dark:via-violet-950/20 dark:to-background" />
        <motion.div
          className="absolute top-0 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 text-sm px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              Portfolio Project • Full-Stack Engineering
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Built a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Production-Grade</span>
              <br />
              Project Management Platform
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              From database schema to pixel-perfect UI. Flask microservices, Node.js APIs, Next.js SSR, 
              real-time notifications, sprint metrics, and secure authentication—all built from scratch.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700">
                <Link href="/organisation">
                  <Play className="w-4 h-4 mr-2" />
                  Try Live Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8">
                <Link href="https://github.com/OMODON-ETEMI/agile-project-management" target="_blank">
                  <Github className="w-4 h-4 mr-2" />
                  View Source Code
                </Link>
              </Button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { label: "Lines of Code", value: "25,000+" },
                { label: "Tech Stack", value: "6 Languages" },
                { label: "Features", value: "15+ Core" },
                { label: "Build Time", value: "3 Months" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Showcase */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Polyglot Engineering</h2>
            <p className="text-lg text-muted-foreground">
              Each technology chosen for a reason. Not just buzzwords.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Code2 className="w-8 h-8" />,
                name: "Next.js 14 + TypeScript",
                reason: "SSR/CSR hybrid, type safety, production routing",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: <Server className="w-8 h-8" />,
                name: "Flask (Python)",
                reason: "Permissions service, rapid API development",
                color: "from-violet-500 to-violet-600",
              },
              {
                icon: <Database className="w-8 h-8" />,
                name: "Node.js (JavaScript)",
                reason: "Notification service, real-time WebSocket",
                color: "from-green-500 to-green-600",
              },
              {
                icon: <Database className="w-8 h-8" />,
                name: "MongoDB (NoSQL)",
                reason: "Flexible schema, document-based queries",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: <Cloud className="w-8 h-8" />,
                name: "React Query (TypeScript)",
                reason: "Optimistic updates, cache management",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                name: "Auth Flow (Security Architecture)",
                reason: "HTTP-only cookies, memory-based tokens",
                color: "from-red-500 to-red-600",
              },
            ].map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onHoverStart={() => setHoveredTech(tech.name)}
                onHoverEnd={() => setHoveredTech(null)}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center text-white mb-4`}>
                      {tech.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{tech.name}</h3>
                    <p className="text-sm text-muted-foreground">{tech.reason}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Highlight */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">System Architecture</h2>
            <p className="text-lg text-muted-foreground">
              Microservices pattern with service-to-service communication
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20 border-2">
            <div className="space-y-8">
              {/* Frontend */}
              <div className="flex items-center gap-4">
                <div className="w-32 text-right font-semibold">Frontend</div>
                <div className="flex-1 flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <Layout className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold">Next.js App</div>
                    <div className="text-sm text-muted-foreground">SSR + CSR • React Query • Auth Context</div>
                  </div>
                </div>
              </div>

              {/* Arrow down */}
              <div className="flex items-center gap-4">
                <div className="w-32"></div>
                <div className="flex-1 flex justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                </div>
              </div>

              {/* Backend Services */}
              <div className="flex items-center gap-4">
                <div className="w-32 text-right font-semibold">Backend</div>
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border-2 border-violet-200 dark:border-violet-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Server className="w-6 h-6 text-violet-600" />
                      <div className="font-semibold">Flask Service</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Permissions • Auth • User Management</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-6 h-6 text-green-600" />
                      <div className="font-semibold">Node Service</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Notifications • WebSocket • Real-time</div>
                  </div>
                </div>
              </div>

              {/* Arrow down */}
              <div className="flex items-center gap-4">
                <div className="w-32"></div>
                <div className="flex-1 flex justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                </div>
              </div>

              {/* Database */}
              <div className="flex items-center gap-4">
                <div className="w-32 text-right font-semibold">Database</div>
                <div className="flex-1 flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                  <Database className="w-6 h-6 text-emerald-600" />
                  <div>
                    <div className="font-semibold">MongoDB</div>
                    <div className="text-sm text-muted-foreground">Document Store • Indexed Queries</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Production Features</h2>
            <p className="text-lg text-muted-foreground">
              Not just a CRUD app. Real functionality that demonstrates system design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Layout className="w-6 h-6" />,
                title: "Kanban Boards",
                desc: "Drag-and-drop issue management with real-time updates",
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: "Real-time Notifications",
                desc: "WebSocket-powered alerts with read/unread tracking",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Sprint Metrics",
                desc: "Burndown charts, velocity tracking, performance trends",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Multi-tenant Orgs",
                desc: "Organisation → Workspace → User hierarchy",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure Auth",
                desc: "HTTP-only cookies, token refresh, SSR-compatible",
              },
              {
                icon: <Cloud className="w-6 h-6" />,
                title: "Scalable Architecture",
                desc: "Microservices, service-to-service calls, Redis caching",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Live Screenshots</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <img 
                src="/modern-project-dashboard-kanban.png" 
                alt="Kanban board"
                className="w-full h-64 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold">Kanban Workflow</h3>
                <p className="text-sm text-muted-foreground">Drag-and-drop issue management</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <img 
                src="/agile-sprint-planning-interface.png" 
                alt="Sprint planning"
                className="w-full h-64 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold">Sprint Planning</h3>
                <p className="text-sm text-muted-foreground">Velocity and burndown charts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Want to See More?</h2>
          <p className="text-xl mb-8 text-white/90">
            Explore the live app or dive into the codebase
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/organisation">
                <Play className="w-4 h-4 mr-2" />
                Try Live Demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 border-white text-white hover:bg-white/10">
              <Link href="https://github.com/OMODON-ETEMI/agile-project-management" target="_blank">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">ProjectFlow</h3>
              <p className="text-sm text-muted-foreground">Built by OMODON ETEMI</p>
            </div>

            <div className="flex gap-4">
              <Link href="https://github.com/OMODON-ETEMI/agile-project-management" target="_blank">
                <Button variant="ghost" size="icon">
                  <Github className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://www.linkedin.com/in/etemi" target="_blank">
                <Button variant="ghost" size="icon">
                  <Linkedin className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Portfolio Project • Crafted to showcase full-stack engineering
          </div>
        </div>
      </footer>
    </div>
  )
}
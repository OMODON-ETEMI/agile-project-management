"use client"

import { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import heroImg from "../../../public/hero-dashboard.png"
import authImg from "../../../public/login-screen.png"
import orgImg from "../../../public/organization-page.png"
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
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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

      {/* Hero Section with Floating Laptop */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto w-full">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 text-sm px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3 h-3 mr-2" />
              Portfolio Project • Full-Stack Engineering
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight max-w-5xl mx-auto">
              Built a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Production-Grade</span>
              <br />
              Project Management Platform
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              From database schema to pixel-perfect UI. Flask microservices, Node.js APIs, Next.js SSR, 
              real-time notifications, sprint metrics, and secure authentication—all built from scratch.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all">
                <Link href="/organisation">
                  <Play className="w-4 h-4 mr-2" />
                  Try Live Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 border-2 hover:border-primary">
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
                  className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border"
                >
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 3D Floating Laptop Mockup */}
          <motion.div
            style={{ y, opacity }}
            initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative max-w-6xl mx-auto"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Laptop frame with Image 1 */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={heroImg}
                  alt="Dashboard Overview"
                  width={1400}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Floating accent elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -right-8 top-20 w-32 h-32 bg-gradient-to-br from-blue-500 to-violet-500 rounded-3xl opacity-20 blur-2xl"
              />
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
                className="absolute -left-8 bottom-20 w-40 h-40 bg-gradient-to-br from-violet-500 to-pink-500 rounded-3xl opacity-20 blur-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Screenshots Bento Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Built for Real Teams</h2>
            <p className="text-lg text-muted-foreground">
              Every feature designed to enhance productivity and collaboration
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Login/Onboarding - Image 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:row-span-2"
            >
              <Card className="h-full overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
                <div className="relative h-full">
                  <Image
                    src={authImg}
                    alt="Secure Authentication Flow"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end p-8">
                    <div>
                      <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
                        Authentication
                      </Badge>
                      <h3 className="text-2xl font-bold mb-2">Secure Sign-In Flow</h3>
                      <p className="text-muted-foreground">
                        HTTP-only cookies, OAuth integration, and seamless user onboarding
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Organization Management - Image 3 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
                <div className="relative h-80">
                  <Image
                    src={orgImg}
                    alt="Organization Management"
                    width={700}
                    height={500}
                    priority
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end p-6">
                    <div>
                      <Badge className="mb-2 bg-violet-500/20 text-violet-400 border-violet-500/30">
                        Multi-tenant
                      </Badge>
                      <h3 className="text-xl font-bold mb-1">Organization Hierarchy</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage teams, workspaces, and members at scale
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tech Stack Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full bg-gradient-to-br from-blue-500 to-violet-600 text-white border-0 hover:shadow-2xl transition-shadow">
                <CardContent className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <Code2 className="w-12 h-12 mb-4 opacity-90" />
                    <h3 className="text-2xl font-bold mb-3">Production-Ready Stack</h3>
                    <p className="text-white/90 mb-6">
                      Microservices architecture with Flask, Node.js, MongoDB, and Next.js
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['TypeScript', 'Python', 'JavaScript', 'MongoDB', 'WebSocket', 'REST API'].map((tech, i) => (
                      <div key={i} className="px-3 py-2 bg-white/20 rounded-lg text-xs font-medium text-center backdrop-blur-sm">
                        {tech}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack Showcase */}
      <section className="py-20 px-6">
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
                name: "Node.js + Express",
                reason: "Notification service, real-time WebSocket",
                color: "from-green-500 to-green-600",
              },
              {
                icon: <Database className="w-8 h-8" />,
                name: "MongoDB",
                reason: "Flexible schema, document-based queries",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                name: "React Query",
                reason: "Optimistic updates, cache management",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                name: "Secure Auth",
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
                whileHover={{ y: -8 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
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
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">System Architecture</h2>
            <p className="text-lg text-muted-foreground">
              Microservices pattern with service-to-service communication
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20 border-2">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-32 text-right font-semibold">Frontend</div>
                <div className="flex-1 flex items-center gap-3 p-4 bg-card rounded-lg border-2 border-blue-500/50">
                  <Layout className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold">Next.js App</div>
                    <div className="text-sm text-muted-foreground">SSR + CSR • React Query • Auth Context</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32"></div>
                <div className="flex-1 flex justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32 text-right font-semibold">Backend</div>
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg border-2 border-violet-500/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Server className="w-6 h-6 text-violet-600" />
                      <div className="font-semibold">Flask Service</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Permissions • Auth • User Management</div>
                  </div>
                  <div className="p-4 bg-card rounded-lg border-2 border-green-500/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-6 h-6 text-green-600" />
                      <div className="font-semibold">Node Service</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Notifications • WebSocket • Real-time</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32"></div>
                <div className="flex-1 flex justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32 text-right font-semibold">Database</div>
                <div className="flex-1 flex items-center gap-3 p-4 bg-card rounded-lg border-2 border-emerald-500/50">
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
            <Button asChild size="lg" variant="outline" className="h-12 px-8 border-2 border-white text-white hover:bg-white/10">
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
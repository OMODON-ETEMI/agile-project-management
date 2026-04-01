
// ==========================================
// 2. APP SETTINGS PAGE
// app/settings/app/page.tsx
// ==========================================

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Zap,
  Database,
  Bell,
  Shield,
  Code,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react"

export default function AppSettingsPage() {
  const [features, setFeatures] = useState({
    realtime: true,
    notifications: true,
    analytics: false,
    debugMode: false,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">App Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure application behavior and features
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current application health and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">99.9%</p>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                    <Activity className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">1.2k</p>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                    <Database className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-xs text-muted-foreground">Storage Used</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable application features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Real-time Updates</p>
                      <p className="text-xs text-muted-foreground">
                        WebSocket connection for live notifications
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={features.realtime}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, realtime: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Browser notifications for important events
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={features.notifications}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, notifications: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Analytics Tracking</p>
                      <p className="text-xs text-muted-foreground">
                        Collect usage data to improve the app
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={features.analytics}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, analytics: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Debug Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Show detailed error messages and logs
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={features.debugMode}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, debugMode: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Services Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Backend Services</CardTitle>
                <CardDescription>Microservices health check</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Flask Auth Service</p>
                      <p className="text-xs text-muted-foreground">
                        Permissions & Authentication
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Node Notification Service</p>
                      <p className="text-xs text-muted-foreground">
                        WebSocket & Notifications
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">MongoDB Database</p>
                      <p className="text-xs text-muted-foreground">
                        Primary data store
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Clear All Cache</p>
                    <p className="text-xs text-muted-foreground">
                      Remove all cached data and force fresh requests
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Reset to Defaults</p>
                    <p className="text-xs text-muted-foreground">
                      Reset all settings to factory defaults
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive">
                    Reset Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// app/dashboard/loading.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonProps {
  sidebar?: boolean
  navbar?: boolean
  cards?: boolean
  table?: boolean
}

export function LoadingSekeleton({ sidebar, navbar, cards, table }: SkeletonProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {sidebar && <aside className="w-64 p-4 border-r bg-muted/40 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </aside>}

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Top Navbar */}
        {navbar && <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>}

        {/* Cards */}
        {cards && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>}

        {/* Table or List */}
        {table && <div className="space-y-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>}
      </main>
    </div>
  )
}

export function Spinner({ size = "sm", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-4",
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-t-transparent border-solid border-gray-300 ${sizeClasses[size]} ${className}`}
      role="status"
    />
  );
}

export const LoadingCard = () => (
  <Card className="h-64 border-0 bg-card/90 backdrop-blur-sm">
    <CardContent className="p-6 h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
          <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-8 bg-muted rounded flex-1 animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
)

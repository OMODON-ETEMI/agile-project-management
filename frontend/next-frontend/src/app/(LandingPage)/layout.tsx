import type React from "react"


export default function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>{children}</>
  )
}

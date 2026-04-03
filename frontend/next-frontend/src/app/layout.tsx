import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css";
import { Toaster } from "react-hot-toast"
import { siteConfig } from "@/src/app/config/site";
import dotenv from 'dotenv';
import { AuthProvider } from "../Authentication/authcontext";
import Providers from "./provider";
import { ThemeProvider } from "../components/shared/theme-provider";
import { WebSocketProvider } from "../helpers/websocket-context";
import { GlobalNotificationListner } from "../components/providers/global";
import { WorkspaceProvider } from "../Authentication/workspacecontext";
import { headers } from "next/headers";

dotenv.config();

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["200", "400", "600", "800"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [
    {
      url: "/logo.svg",
      href: "/logo.svg"
    }
  ]
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const headerList = await headers();
    const token = headerList.get('x-internal-AT');
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
          <Providers>
            <AuthProvider initialToken={token}>
              <WorkspaceProvider>
                <WebSocketProvider>
                <GlobalNotificationListner />
                <Toaster position="bottom-left" />
                {children}
                </WebSocketProvider>
              </WorkspaceProvider>
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

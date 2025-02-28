import { cn } from "@/lib/utils"
import { Providers } from "./providers"
import "./globals.css"
import type React from "react"
import dynamic from "next/dynamic"
import  localFont from "next/font/local"

const Scene3D = dynamic(() => import("./components/Scene3D"), { ssr: true })

const geistSans = localFont({
  src: "./fonts/Lato-Regular.ttf",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", geistSans.className)}>
        <div className="fixed inset-0 -z-10">
          <Scene3D />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}


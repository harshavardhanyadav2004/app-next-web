"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, MessageSquare, ShieldCheck, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const sidebarItems = [
  { title: "User Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Chatbot", href: "/dashboard/chatbot", icon: MessageSquare },
  { title: "AppCraft Dashboard", href: "/dashboard/admin", icon: ShieldCheck },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const SidebarContent = () => (
    <ScrollArea className="my-4 flex flex-col gap-4 px-2">
      <div className="flex flex-col gap-2">
        {sidebarItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              "text-muted-foreground hover:text-foreground",
              pathname === item.href && "bg-secondary text-foreground",
            )}
            onClick={() => setIsOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <div className="flex h-full flex-col">
            <div className="border-b px-6 py-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                AppCraft
              </Link>
            </div>
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background lg:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="border-b px-6 py-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              AppCraft
            </Link>
          </div>
          <SidebarContent />
        </div>
      </div>
    </>
  )
}


"use client"

import * as React from "react"
import {
  Bus,
  Calendar,
  Home,
  Settings,
  Wrench,
  TrendingUp,
  X,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { authManager } from "@/lib/auth"

const data = {
  user: {
    name: "Admin",
    email: "admin@sridevi.com",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: false,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
      isActive: false,
    },
    {
      title: "Bookings",
      url: "#",
      icon: Bus,
      isActive: false,
    },
    {
      title: "Maintenance",
      url: "#",
      icon: Wrench,
      isActive: false,
    },
    {
      title: "Analytics",
      url: "#",
      icon: TrendingUp,
      isActive: false,
      adminOnly: true,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: false,
      adminOnly: true,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string
  onTabChange: (tab: string) => void
  isAdminMode?: boolean
  onAccountClick?: () => void
  onLogout?: () => void
}

export function AppSidebar({ activeTab, onTabChange, isAdminMode = false, onAccountClick, onLogout, ...props }: AppSidebarProps) {
  const { isMobile, toggleSidebar } = useSidebar()
  const navItems = data.navMain
    .filter(item => !item.adminOnly || isAdminMode)
    .map(item => ({
      ...item,
      isActive: activeTab === item.title.toLowerCase(),
      onClick: () => onTabChange(item.title.toLowerCase())
    }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bus className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Sri Devi Bus Transports</span>
          </div>
          {isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={{
            name: authManager.getUser()?.name || data.user.name,
            email: authManager.getUser()?.email || data.user.email
          }} 
          onAccountClick={onAccountClick} 
          onLogout={onLogout} 
        />
      </SidebarFooter>
    </Sidebar>
  )
}
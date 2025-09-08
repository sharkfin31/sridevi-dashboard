"use client"

import * as React from "react"
import {
  Bus,
  Calendar,
  Home,
  Settings,
  Wrench,
  TrendingUp,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@sridevi.com",
    avatar: "/avatars/admin.jpg",
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
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: false,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange, ...props }: AppSidebarProps) {
  const navItems = data.navMain.map(item => ({
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
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
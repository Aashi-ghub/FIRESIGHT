"use client"

import { useState } from "react"
import { Search, Flame, AlertTriangle, MapPin } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    id: "fire-risk",
    title: "Fire Risk Overview",
    icon: Search,
    description: "Live forest fire risk monitoring",
  },
  {
    id: "fire-simulation",
    title: "Fire Spread Simulation",
    icon: Flame,
    description: "Predictive fire spread modeling",
  },
  {
    id: "evacuation",
    title: "Evacuation ETA Panel",
    icon: AlertTriangle,
    description: "Emergency evacuation alerts",
  },
]

export function AppSidebar() {
  const [activeTab, setActiveTab] = useState("fire-risk")

  return (
    <Sidebar className="border-r border-forest-700">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-fire-500 to-fire-600 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-forest-50">FireSight</h2>
            <p className="text-xs text-forest-300">Uttarakhand, India</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-forest-300 font-medium">Dashboard Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setActiveTab(item.id)
                      // Dispatch custom event to update main content
                      window.dispatchEvent(new CustomEvent("tabChange", { detail: item.id }))
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <item.icon className="w-5 h-5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.title}</div>
                        <div className="text-xs text-forest-400 truncate">{item.description}</div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 text-xs text-forest-400">
          <MapPin className="w-3 h-3" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

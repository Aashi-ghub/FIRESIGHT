"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Flame, AlertTriangle, Settings, Menu, X } from "lucide-react"

interface NavigationProps {
  activeModule: string
  setActiveModule: (module: string) => void
}

const navigationItems = [
  {
    id: "fire-probability",
    label: "Fire Probability Map",
    icon: Search,
    description: "Real-time risk assessment",
  },
  {
    id: "spread-simulation",
    label: "Spread Simulation",
    icon: Flame,
    description: "Fire spread modeling",
  },
  {
    id: "evacuation-alerts",
    label: "Evacuation Alerts",
    icon: AlertTriangle,
    description: "Emergency notifications",
  },
  {
    id: "admin-panel",
    label: "Admin Panel",
    icon: Settings,
    description: "System management",
  },
]

export function Navigation({ activeModule, setActiveModule }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-fire-500 to-danger-600 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">FireSight</h1>
              <p className="text-xs text-slate-500 hidden sm:block">ISRO Forest Fire Prediction System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeModule === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`flex items-center space-x-2 px-4 py-2 ${
                    isActive
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveModule(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Status Badge */}
          <div className="hidden sm:flex items-center space-x-3">
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              System Active
            </Badge>
            <div className="text-right">
              <p className="text-xs text-slate-500">Last Updated</p>
              <p className="text-sm font-medium text-slate-900">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeModule === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start space-x-3 ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => {
                      setActiveModule(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

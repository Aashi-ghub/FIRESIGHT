"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Grid3X3, Flame, AlertTriangle, Menu, X, Satellite, Activity } from "lucide-react"

interface MissionControlNavProps {
  activeModule: string
  setActiveModule: (module: string) => void
}

const navigationModules = [
  {
    id: "fire-risk-grid",
    label: "Fire Risk Grid",
    shortLabel: "Risk",
    icon: Grid3X3,
    description: "Probability mapping",
    status: "ACTIVE",
  },
  {
    id: "grid-simulation",
    label: "Grid Simulation",
    shortLabel: "Simulation",
    icon: Flame,
    description: "Spread modeling",
    status: "READY",
  },
  {
    id: "evacuation-command",
    label: "Evacuation Command",
    shortLabel: "Evacuation",
    icon: AlertTriangle,
    description: "Alert system",
    status: "STANDBY",
  },
]

export function MissionControlNav({ activeModule, setActiveModule }: MissionControlNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16 gap-2 sm:gap-4">
          {/* Left: Mission Control Branding */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 mission-control-font">FIRESIGHT</h1>
              <p className="text-xs text-slate-600 mission-control-font hidden sm:block">ISRO GRID SIMULATOR</p>
            </div>
          </div>

          {/* Center: Navigation Modules - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-3xl">
            <div className="flex items-center space-x-1 lg:space-x-2">
              {navigationModules.map((module) => {
                const Icon = module.icon
                const isActive = activeModule === module.id
                return (
                  <Button
                    key={module.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 mission-control-font text-xs lg:text-sm ${
                      isActive
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <Icon className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="hidden lg:inline font-semibold">{module.label}</span>
                    <span className="lg:hidden font-semibold">{module.shortLabel}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs hidden xl:flex ${
                        module.status === "ACTIVE"
                          ? "border-emerald-400 text-emerald-400"
                          : module.status === "READY"
                            ? "border-yellow-400 text-yellow-400"
                            : "border-slate-400 text-slate-400"
                      }`}
                    >
                      {module.status}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Right: Status and Mobile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Satellite Status - Hidden on mobile */}
            <div className="hidden sm:flex items-center space-x-1 sm:space-x-2">
              <Satellite className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm text-slate-700 mission-control-font hidden lg:inline">SAT-LINK</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>

            {/* Mission Time - Hidden on mobile and tablet */}
            <div className="hidden lg:flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <div className="text-right">
                <p className="text-xs text-slate-600 mission-control-font">MISSION TIME</p>
                <p className="text-sm font-bold text-slate-900 mission-control-font">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Mobile/Tablet menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-700 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="py-3 space-y-1">
              {navigationModules.map((module) => {
                const Icon = module.icon
                const isActive = activeModule === module.id
                return (
                  <Button
                    key={module.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start space-x-3 mission-control-font p-3 ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:text-slate-900"
                    }`}
                    onClick={() => {
                      setActiveModule(module.id)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-semibold">{module.label}</div>
                      <div className="text-sm opacity-70">{module.description}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        module.status === "ACTIVE"
                          ? "border-emerald-400 text-emerald-400"
                          : module.status === "READY"
                            ? "border-yellow-400 text-yellow-400"
                            : "border-slate-400 text-slate-400"
                      }`}
                    >
                      {module.status}
                    </Badge>
                  </Button>
                )
              })}
            </div>

            {/* Mobile Status Footer */}
            <div className="px-3 py-3 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Satellite className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-700 mission-control-font">SAT-LINK ACTIVE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-slate-700 mission-control-font">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

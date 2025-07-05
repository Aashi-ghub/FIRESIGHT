"use client"

import { useState, useEffect } from "react"
import { MissionControlNav } from "@/components/mission-control-nav"
import { FireRiskGrid } from "@/components/fire-risk-grid"
import { EnhancedGridSimulation } from "@/components/enhanced-grid-simulation"
import { EvacuationCommand } from "@/components/evacuation-command"

export default function FireSightDashboard() {
  const [activeModule, setActiveModule] = useState("fire-risk-grid")

  // Listen for module switch events
  useEffect(() => {
    const handleModuleSwitch = (event: any) => {
      console.log("Module switch event received:", event.detail)

      if (event.detail.module) {
        setActiveModule(event.detail.module)

        // Store simulation data if provided
        if (event.detail.startCell) {
          sessionStorage.setItem("simulationStartCell", JSON.stringify(event.detail))
        }
      }
    }

    const handlePostMessage = (event: any) => {
      if (event.data.type === "SWITCH_MODULE") {
        console.log("PostMessage received:", event.data)
        setActiveModule(event.data.data.module)

        if (event.data.data.startCell) {
          sessionStorage.setItem("simulationStartCell", JSON.stringify(event.data.data))
        }
      }
    }

    window.addEventListener("switchModule", handleModuleSwitch)
    window.addEventListener("message", handlePostMessage)

    return () => {
      window.removeEventListener("switchModule", handleModuleSwitch)
      window.removeEventListener("message", handlePostMessage)
    }
  }, [])

  const renderContent = () => {
    switch (activeModule) {
      case "fire-risk-grid":
        return <FireRiskGrid />
      case "grid-simulation":
        return <EnhancedGridSimulation />
      case "evacuation-command":
        return <EvacuationCommand />
      default:
        return <FireRiskGrid />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      <MissionControlNav activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="pt-12 sm:pt-14 lg:pt-16">{renderContent()}</main>
    </div>
  )
}

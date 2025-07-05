"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MapPin, Clock, Send, Bell } from "lucide-react"

const evacuationData = [
  { village: "Bajira", eta: "15 mins", alertLevel: "High", color: "destructive", priority: 1 },
  { village: "Falsaun", eta: "20 mins", alertLevel: "Moderate", color: "default", priority: 2 },
  { village: "Bair Bagar", eta: "30 mins", alertLevel: "Moderate", color: "default", priority: 3 },
  { village: "Asnoli", eta: "45 mins", alertLevel: "Low", color: "secondary", priority: 4 },
  { village: "Bansi", eta: "60 mins", alertLevel: "Low", color: "secondary", priority: 5 },
]

const getAlertIcon = (level: string) => {
  switch (level) {
    case "High":
      return "🔴"
    case "Moderate":
      return "🟠"
    default:
      return "🟡"
  }
}

export function EvacuationPanel() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Evacuation Table */}
        <div className="lg:w-1/2 space-y-4">
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-fire-500" />
                Evacuation Alerts – Nearby Villages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {evacuationData.map((item, index) => (
                  <div
                    key={item.village}
                    className={`p-4 rounded-lg border-l-4 ${
                      item.alertLevel === "High"
                        ? "bg-danger-900/20 border-danger-500"
                        : item.alertLevel === "Moderate"
                          ? "bg-fire-900/20 border-fire-500"
                          : "bg-yellow-900/20 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getAlertIcon(item.alertLevel)}</span>
                        <div>
                          <p className="text-forest-100 font-medium">{item.village}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-forest-400" />
                            <span className="text-forest-300 text-sm">ETA: {item.eta}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={item.color as any} className="text-xs">
                        {item.alertLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert Status Card */}
          <Card className="bg-gradient-to-r from-fire-600 to-danger-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">🚨 Last Alert Sent</p>
                  <p className="text-white text-lg font-bold">10:34 AM – To 3 Villages</p>
                  <p className="text-white/70 text-xs mt-1">High priority evacuation notice</p>
                </div>
                <Bell className="w-8 h-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-fire-600 hover:bg-fire-700 text-white">
            <Send className="w-4 h-4 mr-2" />
            Trigger New Alert
          </Button>
        </div>

        {/* Right Panel - Evacuation Map */}
        <div className="lg:w-1/2">
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50">Evacuation Zone Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-forest-900 to-forest-800 rounded-lg overflow-hidden">
                {/* Terrain background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-green-900"></div>
                </div>

                {/* Fire source */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-gradient-to-br from-fire-400 to-danger-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs">🔥</span>
                  </div>
                  <div className="absolute inset-0 bg-fire-500 rounded-full animate-ripple opacity-30"></div>
                </div>

                {/* Village markers with threat rings */}
                {evacuationData.map((village, index) => {
                  const positions = [
                    { left: "25%", top: "35%" }, // Bajira - closest
                    { left: "70%", top: "25%" }, // Falsaun
                    { left: "30%", top: "70%" }, // Bair Bagar
                    { left: "75%", top: "65%" }, // Asnoli
                    { left: "15%", top: "80%" }, // Bansi - farthest
                  ]

                  const position = positions[index]
                  const ringColor =
                    village.alertLevel === "High"
                      ? "border-danger-500 bg-danger-500/10"
                      : village.alertLevel === "Moderate"
                        ? "border-fire-500 bg-fire-500/10"
                        : "border-yellow-500 bg-yellow-500/10"

                  return (
                    <div
                      key={village.village}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={position}
                    >
                      {/* Threat level ring */}
                      <div className={`absolute w-12 h-12 rounded-full border-2 ${ringColor} animate-pulse`}></div>

                      {/* Village marker */}
                      <div className="relative w-6 h-6 bg-white rounded-full border-2 border-forest-600 flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-forest-800" />
                      </div>

                      {/* Village info */}
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-forest-800/90 px-2 py-1 rounded text-xs text-forest-100 whitespace-nowrap">
                        <div className="font-medium">{village.village}</div>
                        <div className="text-forest-300">{village.eta}</div>
                      </div>
                    </div>
                  )
                })}

                {/* Evacuation routes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                    </marker>
                  </defs>
                  {/* Sample evacuation route */}
                  <path
                    d="M 25% 35% Q 40% 20% 80% 10%"
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                    opacity="0.7"
                  />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-forest-800/90 p-3 rounded-lg">
                  <p className="text-forest-100 text-sm font-medium mb-2">Threat Levels</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-danger-500 rounded-full"></div>
                      <span className="text-forest-300 text-xs">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-fire-500 rounded-full"></div>
                      <span className="text-forest-300 text-xs">Moderate Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-yellow-500 rounded-full"></div>
                      <span className="text-forest-300 text-xs">Low Risk</span>
                    </div>
                  </div>
                </div>

                {/* Evacuation info */}
                <div className="absolute top-4 right-4 bg-forest-800/90 p-3 rounded-lg">
                  <p className="text-forest-100 text-sm font-medium">Active Alerts</p>
                  <p className="text-fire-400 text-2xl font-bold">5</p>
                  <p className="text-forest-300 text-xs">Villages notified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card className="bg-forest-800/30 border-forest-700">
              <CardContent className="p-3 text-center">
                <p className="text-forest-300 text-xs">Total Population</p>
                <p className="text-forest-100 text-lg font-bold">2,847</p>
              </CardContent>
            </Card>
            <Card className="bg-forest-800/30 border-forest-700">
              <CardContent className="p-3 text-center">
                <p className="text-forest-300 text-xs">Evacuation Routes</p>
                <p className="text-forest-100 text-lg font-bold">12</p>
              </CardContent>
            </Card>
            <Card className="bg-forest-800/30 border-forest-700">
              <CardContent className="p-3 text-center">
                <p className="text-forest-300 text-xs">Safe Zones</p>
                <p className="text-forest-100 text-lg font-bold">8</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

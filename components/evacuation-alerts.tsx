"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Send, MapPin, Users, Route, Shield } from "lucide-react"

const evacuationData = [
  { village: "Bajira", eta: "15 mins", alertLevel: "High", population: 847, distance: "2.1 km", status: "Active" },
  { village: "Falsaun", eta: "20 mins", alertLevel: "Medium", population: 623, distance: "3.2 km", status: "Sent" },
  { village: "Asnoli", eta: "45 mins", alertLevel: "Low", population: 1205, distance: "7.8 km", status: "Monitoring" },
]

const getAlertColor = (level: string) => {
  switch (level) {
    case "High":
      return "destructive"
    case "Medium":
      return "default"
    default:
      return "secondary"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-red-100 text-red-800"
    case "Sent":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-slate-100 text-slate-800"
  }
}

export function EvacuationAlerts() {
  const [lastAlertTime] = useState("10:34 AM")
  const [alertsSent] = useState(3)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Evacuation Alerts</h1>
        <p className="text-slate-600">Emergency notification system for at-risk communities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Management */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">🚨 Last Alert Sent</p>
                  <p className="text-lg font-bold text-red-800">{lastAlertTime}</p>
                  <p className="text-xs text-red-600">To {alertsSent} villages</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
            <Send className="w-4 h-4 mr-2" />
            Trigger New Alert
          </Button>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                <p className="text-lg font-bold text-slate-900">2,675</p>
                <p className="text-xs text-slate-600">Total Population</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Route className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                <p className="text-lg font-bold text-slate-900">12</p>
                <p className="text-xs text-slate-600">Evacuation Routes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                <p className="text-lg font-bold text-slate-900">8</p>
                <p className="text-xs text-slate-600">Safe Zones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                <p className="text-lg font-bold text-slate-900">3</p>
                <p className="text-xs text-slate-600">Active Alerts</p>
              </CardContent>
            </Card>
          </div>

          {/* Alert History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">10:34 AM</span>
                  <Badge variant="destructive" className="text-xs">
                    High Priority
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">09:15 AM</span>
                  <Badge variant="default" className="text-xs">
                    Medium Priority
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">08:42 AM</span>
                  <Badge variant="secondary" className="text-xs">
                    Advisory
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evacuation Table and Map */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Village Evacuation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evacuationData.map((item) => (
                  <div
                    key={item.village}
                    className={`p-4 rounded-lg border-l-4 ${
                      item.alertLevel === "High"
                        ? "bg-red-50 border-red-500"
                        : item.alertLevel === "Medium"
                          ? "bg-orange-50 border-orange-500"
                          : "bg-slate-50 border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.village}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span className="text-sm text-slate-600">ETA: {item.eta}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-slate-500" />
                              <span className="text-sm text-slate-600">{item.population} people</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span className="text-sm text-slate-600">{item.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getAlertColor(item.alertLevel) as any}>{item.alertLevel}</Badge>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evacuation Map */}
          <Card>
            <CardHeader>
              <CardTitle>Evacuation Zone Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden grid-pattern">
                {/* Fire source */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs">🔥</span>
                  </div>
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ripple opacity-30"></div>
                </div>

                {/* Village markers */}
                {evacuationData.map((village, index) => {
                  const positions = [
                    { left: "30%", top: "40%" }, // Bajira - closest
                    { left: "65%", top: "30%" }, // Falsaun
                    { left: "75%", top: "70%" }, // Asnoli - farthest
                  ]

                  const position = positions[index]
                  const ringColor =
                    village.alertLevel === "High"
                      ? "border-red-500 bg-red-500/10"
                      : village.alertLevel === "Medium"
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-slate-400 bg-slate-400/10"

                  return (
                    <div
                      key={village.village}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={position}
                    >
                      {/* Alert radius */}
                      <div className={`absolute w-12 h-12 rounded-full border-2 ${ringColor} animate-pulse`}></div>

                      {/* Village marker */}
                      <div className="relative w-4 h-4 bg-white rounded-full border-2 border-slate-600 flex items-center justify-center shadow-sm">
                        <MapPin className="w-2 h-2 text-slate-700" />
                      </div>

                      {/* Village info */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-slate-700 shadow-sm whitespace-nowrap">
                        <div>{village.village}</div>
                        <div className="text-slate-500">{village.eta}</div>
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
                  <path
                    d="M 30% 40% Q 15% 20% 5% 10%"
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                    opacity="0.7"
                  />
                  <path
                    d="M 65% 30% Q 80% 15% 95% 10%"
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                    opacity="0.7"
                  />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-slate-900 mb-2">Alert Levels</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-red-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">High Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-orange-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">Medium Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-slate-400 rounded-full"></div>
                      <span className="text-xs text-slate-600">Low Priority</span>
                    </div>
                  </div>
                </div>

                {/* Safe zones indicator */}
                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">8 Safe Zones</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

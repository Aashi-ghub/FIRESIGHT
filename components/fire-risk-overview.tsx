"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Flame, MapPin, Thermometer, Wind, Droplets } from "lucide-react"

const villageData = [
  { name: "Bajira", district: "Rudraprayag", riskIndex: 70, lat: 30.5, lng: 79.1 },
  { name: "Agar", district: "Tehri Garhwal", riskIndex: 65, lat: 30.4, lng: 78.9 },
  { name: "Falsaun", district: "Almora", riskIndex: 50, lat: 29.8, lng: 79.7 },
  { name: "Bair Bagar", district: "Chamoli", riskIndex: 45, lat: 30.2, lng: 79.3 },
  { name: "Asnoli", district: "Pauri Garhwal", riskIndex: 30, lat: 30.1, lng: 78.8 },
]

const getRiskColor = (risk: number) => {
  if (risk > 60) return "bg-danger-500"
  if (risk >= 40) return "bg-fire-500"
  return "bg-yellow-500"
}

const getRiskLevel = (risk: number) => {
  if (risk > 60) return { level: "High", color: "destructive" }
  if (risk >= 40) return { level: "Moderate", color: "default" }
  return { level: "Low", color: "secondary" }
}

export function FireRiskOverview() {
  const [selectedDistrict, setSelectedDistrict] = useState("Chamoli")

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Controls and Stats */}
        <div className="lg:w-1/3 space-y-4">
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50 flex items-center gap-2">
                <Flame className="w-5 h-5 text-fire-500" />
                Live Forest Fire Risk – Uttarakhand
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-forest-300 mb-2 block">Select District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="bg-forest-700 border-forest-600 text-forest-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-forest-800 border-forest-600">
                    <SelectItem value="Chamoli">Chamoli</SelectItem>
                    <SelectItem value="Rudraprayag">Rudraprayag</SelectItem>
                    <SelectItem value="Pauri Garhwal">Pauri Garhwal</SelectItem>
                    <SelectItem value="Tehri Garhwal">Tehri Garhwal</SelectItem>
                    <SelectItem value="Almora">Almora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-gradient-to-r from-fire-600 to-danger-600 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">🔥 Fire Risk Index Today</p>
                      <p className="text-2xl font-bold text-white">72 / 100</p>
                    </div>
                    <Flame className="w-8 h-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full bg-fire-600 hover:bg-fire-700 text-white"
                onClick={() => window.dispatchEvent(new CustomEvent("tabChange", { detail: "fire-simulation" }))}
              >
                Simulate Fire Spread
              </Button>
            </CardContent>
          </Card>

          {/* Weather Conditions */}
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50 text-lg">Current Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-fire-500" />
                  <span className="text-forest-300">Temperature</span>
                </div>
                <span className="text-forest-100 font-medium">33°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-forest-300">Humidity</span>
                </div>
                <span className="text-forest-100 font-medium">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-forest-400" />
                  <span className="text-forest-300">Wind Speed</span>
                </div>
                <span className="text-forest-100 font-medium">18 km/h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Map and Village Data */}
        <div className="lg:w-2/3 space-y-4">
          {/* Mock Map */}
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50">Risk Zone Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-forest-900 to-forest-800 rounded-lg overflow-hidden">
                {/* Mock terrain background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-green-900"></div>
                </div>

                {/* Village markers */}
                {villageData.map((village, index) => (
                  <div
                    key={village.name}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`,
                    }}
                  >
                    {/* Risk zone ring */}
                    <div
                      className={`absolute w-16 h-16 rounded-full ${getRiskColor(village.riskIndex)} opacity-20 animate-pulse`}
                    ></div>
                    <div
                      className={`absolute w-12 h-12 rounded-full ${getRiskColor(village.riskIndex)} opacity-40`}
                    ></div>

                    {/* Village pin */}
                    <div className="relative w-6 h-6 bg-white rounded-full border-2 border-forest-600 flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-forest-800" />
                    </div>

                    {/* Village label */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-forest-800/90 px-2 py-1 rounded text-xs text-forest-100 whitespace-nowrap">
                      {village.name}
                    </div>
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-forest-800/90 p-3 rounded-lg">
                  <p className="text-forest-100 text-sm font-medium mb-2">Risk Levels</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                      <span className="text-forest-300 text-xs">High (&gt;60)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-fire-500 rounded-full"></div>
                      <span className="text-forest-300 text-xs">Moderate (40-60)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-forest-300 text-xs">Low (&lt;40)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Village Risk Table */}
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50">Village Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {villageData.map((village) => {
                  const risk = getRiskLevel(village.riskIndex)
                  return (
                    <div
                      key={village.name}
                      className="flex items-center justify-between p-3 bg-forest-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(village.riskIndex)}`}></div>
                        <div>
                          <p className="text-forest-100 font-medium">{village.name}</p>
                          <p className="text-forest-400 text-sm">{village.district}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-forest-100 font-mono">{village.riskIndex}</span>
                        <Badge variant={risk.color as any} className="text-xs">
                          {risk.level}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

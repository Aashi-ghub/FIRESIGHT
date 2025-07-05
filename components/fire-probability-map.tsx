"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Thermometer, Wind, Droplets, Calendar, Play } from "lucide-react"

const riskData = [
  { name: "Bair Bagar", risk: 45, lat: 30.2, lng: 79.3, district: "Chamoli" },
  { name: "Bajira", risk: 70, lat: 30.5, lng: 79.1, district: "Rudraprayag" },
  { name: "Agar", risk: 65, lat: 30.4, lng: 78.9, district: "Tehri Garhwal" },
  { name: "Falsaun", risk: 50, lat: 29.8, lng: 79.7, district: "Almora" },
]

const getRiskColor = (risk: number) => {
  if (risk >= 60) return "bg-red-500"
  if (risk >= 40) return "bg-orange-500"
  return "bg-yellow-500"
}

const getRiskLevel = (risk: number) => {
  if (risk >= 60) return { level: "High", color: "destructive" }
  if (risk >= 40) return { level: "Medium", color: "default" }
  return { level: "Low", color: "secondary" }
}

export function FireProbabilityMap() {
  const [selectedDistrict, setSelectedDistrict] = useState("all")

  const filteredData =
    selectedDistrict === "all" ? riskData : riskData.filter((item) => item.district === selectedDistrict)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Fire Probability Map</h1>
        <p className="text-slate-600">Real-time forest fire risk assessment for Uttarakhand</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Assessment Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Choose District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Chamoli">Chamoli</SelectItem>
                    <SelectItem value="Rudraprayag">Rudraprayag</SelectItem>
                    <SelectItem value="Pauri Garhwal">Pauri Garhwal</SelectItem>
                    <SelectItem value="Tehri Garhwal">Tehri Garhwal</SelectItem>
                    <SelectItem value="Almora">Almora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700">🔥 Fire Risk Index</p>
                      <p className="text-2xl font-bold text-red-800">
                        {Math.max(...riskData.map((d) => d.risk))} / 100
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xl">🔥</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full bg-slate-900 hover:bg-slate-800">
                <Play className="w-4 h-4 mr-2" />
                Start Fire Spread Simulation
              </Button>
            </CardContent>
          </Card>

          {/* Weather Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Weather</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-600">Temperature</span>
                </div>
                <span className="font-medium">33°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-600">Humidity</span>
                </div>
                <span className="font-medium">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Wind Speed</span>
                </div>
                <span className="font-medium">18 km/h East</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Last Updated</span>
                </div>
                <span className="font-medium text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Visualization */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uttarakhand Fire Risk Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden grid-pattern">
                {/* Risk zones overlay */}
                <div className="absolute inset-0">
                  {/* High risk zone */}
                  <div className="absolute top-1/4 right-1/3 w-24 h-20 bg-red-500 opacity-30 rounded-full animate-pulse"></div>
                  {/* Medium risk zones */}
                  <div className="absolute top-1/2 left-1/4 w-20 h-16 bg-orange-500 opacity-25 rounded-full"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-18 h-14 bg-orange-500 opacity-25 rounded-full"></div>
                  {/* Low risk zone */}
                  <div className="absolute bottom-1/4 left-1/3 w-16 h-12 bg-yellow-500 opacity-20 rounded-full"></div>
                </div>

                {/* Village markers */}
                {filteredData.map((location, index) => (
                  <div
                    key={location.name}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${25 + index * 15}%`,
                      top: `${30 + index * 12}%`,
                    }}
                  >
                    {/* Risk indicator ring */}
                    <div
                      className={`absolute w-8 h-8 rounded-full ${getRiskColor(location.risk)} opacity-40 animate-pulse`}
                    ></div>

                    {/* Location pin */}
                    <div className="relative w-4 h-4 bg-white rounded-full border-2 border-slate-600 flex items-center justify-center shadow-sm">
                      <MapPin className="w-2 h-2 text-slate-700" />
                    </div>

                    {/* Location label */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-slate-700 shadow-sm whitespace-nowrap">
                      {location.name}
                      <div className="text-xs text-slate-500">{location.risk}</div>
                    </div>
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-slate-900 mb-2">Risk Levels</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">High (≥60)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">Medium (40-59)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">Low (&lt;40)</span>
                    </div>
                  </div>
                </div>

                {/* Grid coordinates */}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-slate-600">
                  Grid: 30.2°N, 79.1°E
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Location Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredData.map((location) => {
                  const risk = getRiskLevel(location.risk)
                  return (
                    <div key={location.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(location.risk)}`}></div>
                        <div>
                          <p className="font-medium text-slate-900">{location.name}</p>
                          <p className="text-sm text-slate-500">{location.district}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-lg font-bold text-slate-900">{location.risk}</span>
                        <Badge variant={risk.color as any}>{risk.level}</Badge>
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

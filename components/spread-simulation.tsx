"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Mountain, Wind, Thermometer, Droplets } from "lucide-react"

export function SpreadSimulation() {
  const [timeHours, setTimeHours] = useState([0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)

  // Auto-play simulation
  useEffect(() => {
    if (isPlaying && timeHours[0] < 12) {
      const interval = setInterval(() => {
        setTimeHours((prev) => [Math.min(prev[0] + 0.5, 12)])
      }, 1000 / simulationSpeed)
      return () => clearInterval(interval)
    } else if (timeHours[0] >= 12) {
      setIsPlaying(false)
    }
  }, [isPlaying, timeHours, simulationSpeed])

  const getSpreadRadius = (hours: number) => {
    return Math.min(hours * 15, 120) // Max radius at 12 hours
  }

  const resetSimulation = () => {
    setTimeHours([0])
    setIsPlaying(false)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Fire Spread Simulation</h1>
        <p className="text-slate-600">Predictive modeling using Von Neumann neighborhood logic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Simulation Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Timeline</label>
                  <Badge variant="outline" className="font-mono">
                    {timeHours[0]}h
                  </Badge>
                </div>
                <Slider value={timeHours} onValueChange={setTimeHours} max={12} step={0.5} className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={isPlaying ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button variant="outline" size="sm" onClick={resetSimulation}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Speed</label>
                <Slider
                  value={[simulationSpeed]}
                  onValueChange={(value) => setSimulationSpeed(value[0])}
                  min={0.5}
                  max={3}
                  step={0.5}
                  className="w-full"
                />
                <div className="text-xs text-slate-500 mt-1">{simulationSpeed}x speed</div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environmental Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-slate-600">Temp</span>
                  </div>
                  <p className="font-bold text-slate-900">33°C</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-600">RH</span>
                  </div>
                  <p className="font-bold text-slate-900">30%</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Wind className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Wind</span>
                </div>
                <p className="font-bold text-slate-900">18 km/h East</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Mountain className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-600">Terrain</span>
                </div>
                <p className="font-bold text-slate-900">Moderate Slope</p>
                <p className="text-xs text-slate-500">Pine/Oak Forest</p>
              </div>

              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-3">
                  <p className="text-sm text-orange-700">Spread Speed</p>
                  <p className="text-xl font-bold text-orange-800">1.2 km/h</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Simulation Visualization */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fire Spread Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden grid-pattern">
                {/* Terrain features */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/4 left-1/3 w-16 h-12 bg-green-600 rounded-full transform rotate-12"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-20 h-16 bg-green-600 rounded-full transform -rotate-12"></div>
                </div>

                {/* Fire spread visualization */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* Hour 1 spread */}
                  {timeHours[0] >= 1 && (
                    <div
                      className="absolute bg-red-400 opacity-30 rounded-full animate-pulse"
                      style={{
                        width: `${getSpreadRadius(1)}px`,
                        height: `${getSpreadRadius(1)}px`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    ></div>
                  )}

                  {/* Hour 2 spread */}
                  {timeHours[0] >= 2 && (
                    <div
                      className="absolute bg-red-500 opacity-25 rounded-full animate-pulse"
                      style={{
                        width: `${getSpreadRadius(2)}px`,
                        height: `${getSpreadRadius(2)}px`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    ></div>
                  )}

                  {/* Hour 3 spread */}
                  {timeHours[0] >= 3 && (
                    <div
                      className="absolute bg-red-600 opacity-20 rounded-full animate-pulse"
                      style={{
                        width: `${getSpreadRadius(3)}px`,
                        height: `${getSpreadRadius(3)}px`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    ></div>
                  )}

                  {/* Hour 6 spread */}
                  {timeHours[0] >= 6 && (
                    <div
                      className="absolute bg-red-700 opacity-15 rounded-full animate-pulse"
                      style={{
                        width: `${getSpreadRadius(6)}px`,
                        height: `${getSpreadRadius(6)}px`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    ></div>
                  )}

                  {/* Hour 12 spread */}
                  {timeHours[0] >= 12 && (
                    <div
                      className="absolute bg-red-800 opacity-10 rounded-full animate-pulse"
                      style={{
                        width: `${getSpreadRadius(12)}px`,
                        height: `${getSpreadRadius(12)}px`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    ></div>
                  )}

                  {/* Fire origin point */}
                  <div className="relative w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs">🔥</span>
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ripple opacity-50"></div>
                  </div>
                </div>

                {/* Wind direction indicator */}
                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium">East</span>
                    <div className="w-4 h-0.5 bg-slate-400 transform rotate-90"></div>
                  </div>
                </div>

                {/* Simulation stats */}
                <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-slate-900">Simulation Time</p>
                  <p className="text-2xl font-bold text-red-600">{timeHours[0]}h</p>
                  {timeHours[0] > 0 && (
                    <p className="text-xs text-slate-600">
                      Area: ~{Math.round(Math.PI * Math.pow(timeHours[0] * 1.2, 2))} km²
                    </p>
                  )}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-slate-900 mb-2">Spread Timeline</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-xs text-slate-600">1-2h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">3-6h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-700 rounded-full"></div>
                      <span className="text-xs text-slate-600">6-12h</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulation Grid */}
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 6, 12].map((hour) => (
              <Card key={hour} className={`${timeHours[0] >= hour ? "bg-red-50 border-red-200" : "bg-slate-50"}`}>
                <CardContent className="p-3 text-center">
                  <p className="text-sm font-medium text-slate-700">Hour {hour}</p>
                  <p className="text-lg font-bold text-red-600">
                    {timeHours[0] >= hour ? `${Math.round(Math.PI * Math.pow(hour * 1.2, 2))}` : "0"} km²
                  </p>
                  <p className="text-xs text-slate-500">Affected Area</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

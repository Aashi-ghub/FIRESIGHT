"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Flame, Wind, Thermometer, Mountain, RotateCcw, Play, Pause } from "lucide-react"

export function FireSpreadSimulation() {
  const [timeValue, setTimeValue] = useState([0])
  const [isPlaying, setIsPlaying] = useState(false)

  const getSpreadRadius = (time: number) => {
    return Math.min(time * 20, 120) // Max radius of 120px at 3 hours
  }

  const resetSimulation = () => {
    setTimeValue([0])
    setIsPlaying(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Simulation Controls */}
        <div className="lg:w-1/3 space-y-4">
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50 flex items-center gap-2">
                <Flame className="w-5 h-5 text-fire-500" />
                Fire Spread Simulation – Bajira Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-forest-300">Timeline</label>
                  <Badge variant="outline" className="text-forest-100 border-forest-600">
                    {timeValue[0]} hours
                  </Badge>
                </div>
                <Slider value={timeValue} onValueChange={setTimeValue} max={3} step={0.5} className="w-full" />
                <div className="flex justify-between text-xs text-forest-400 mt-1">
                  <span>0h</span>
                  <span>1.5h</span>
                  <span>3h</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 border-forest-600 text-forest-100 hover:bg-forest-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSimulation}
                  className="border-forest-600 text-forest-100 hover:bg-forest-700 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Conditions */}
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50 text-lg">Environmental Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-forest-700/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-forest-400" />
                    <span className="text-forest-300 text-sm">Wind</span>
                  </div>
                  <p className="text-forest-100 font-medium">18 km/h</p>
                  <p className="text-forest-400 text-xs">⬅️ East</p>
                </div>

                <div className="bg-forest-700/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-fire-500" />
                    <span className="text-forest-300 text-sm">Temp</span>
                  </div>
                  <p className="text-forest-100 font-medium">33°C</p>
                  <p className="text-forest-400 text-xs">RH: 30%</p>
                </div>
              </div>

              <div className="bg-forest-700/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mountain className="w-4 h-4 text-forest-400" />
                  <span className="text-forest-300 text-sm">Terrain</span>
                </div>
                <p className="text-forest-100 font-medium">Steep Slope</p>
                <p className="text-forest-400 text-xs">Elevation: 1,200m</p>
              </div>

              <div className="bg-gradient-to-r from-fire-600 to-danger-600 p-3 rounded-lg">
                <p className="text-white text-sm">Spread Speed</p>
                <p className="text-white text-xl font-bold">1.2 km/h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Simulation Map */}
        <div className="lg:w-2/3">
          <Card className="bg-forest-800/30 border-forest-700">
            <CardHeader>
              <CardTitle className="text-forest-50">Fire Spread Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-forest-900 to-forest-800 rounded-lg overflow-hidden">
                {/* Terrain background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-green-900"></div>
                  {/* Terrain features */}
                  <div className="absolute top-1/4 left-1/3 w-20 h-16 bg-green-600 opacity-40 rounded-full transform rotate-12"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-24 h-20 bg-green-600 opacity-40 rounded-full transform -rotate-12"></div>
                </div>

                {/* Fire ignition point */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* Fire spread rings based on time */}
                  {timeValue[0] > 0 && (
                    <>
                      {/* 30-minute spread */}
                      {timeValue[0] >= 0.5 && (
                        <div
                          className="absolute bg-fire-500 opacity-20 rounded-full animate-pulse"
                          style={{
                            width: `${getSpreadRadius(0.5)}px`,
                            height: `${getSpreadRadius(0.5)}px`,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        ></div>
                      )}

                      {/* 60-minute spread */}
                      {timeValue[0] >= 1 && (
                        <div
                          className="absolute bg-fire-600 opacity-15 rounded-full animate-pulse"
                          style={{
                            width: `${getSpreadRadius(1)}px`,
                            height: `${getSpreadRadius(1)}px`,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        ></div>
                      )}

                      {/* 90-minute spread */}
                      {timeValue[0] >= 1.5 && (
                        <div
                          className="absolute bg-danger-500 opacity-10 rounded-full animate-pulse"
                          style={{
                            width: `${getSpreadRadius(1.5)}px`,
                            height: `${getSpreadRadius(1.5)}px`,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        ></div>
                      )}
                    </>
                  )}

                  {/* Central fire point */}
                  <div className="relative w-8 h-8 bg-gradient-to-br from-fire-400 to-danger-600 rounded-full flex items-center justify-center animate-pulse">
                    <Flame className="w-4 h-4 text-white" />
                    {/* Ripple effect */}
                    <div className="absolute inset-0 bg-fire-500 rounded-full animate-ripple"></div>
                  </div>
                </div>

                {/* Wind direction indicator */}
                <div className="absolute top-4 right-4 bg-forest-800/90 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-forest-300" />
                    <span className="text-forest-100 text-sm">Wind: E</span>
                    <div className="w-6 h-1 bg-forest-400 rounded transform rotate-90"></div>
                  </div>
                </div>

                {/* Time indicator */}
                <div className="absolute bottom-4 left-4 bg-forest-800/90 p-3 rounded-lg">
                  <p className="text-forest-100 text-sm font-medium">Simulation Time</p>
                  <p className="text-fire-400 text-lg font-bold">{timeValue[0]} hours</p>
                  {timeValue[0] > 0 && (
                    <p className="text-forest-300 text-xs">
                      Affected area: ~{Math.round(Math.PI * Math.pow(timeValue[0] * 1.2, 2))} km²
                    </p>
                  )}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-forest-800/90 p-3 rounded-lg">
                  <p className="text-forest-100 text-sm font-medium mb-2">Spread Timeline</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-fire-500 rounded-full opacity-60"></div>
                      <span className="text-forest-300 text-xs">30 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-fire-600 rounded-full opacity-60"></div>
                      <span className="text-forest-300 text-xs">60 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-danger-500 rounded-full opacity-60"></div>
                      <span className="text-forest-300 text-xs">90+ min</span>
                    </div>
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

"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Wind, Thermometer, Mountain, Activity } from "lucide-react"

// Chamoli district center coordinates
const CHAMOLI_CENTER = [30.4167, 79.3167] as [number, number]
const GRID_SIZE = 10

// Fire spread simulation using Moore neighborhood (8-directional)
const simulateFireSpread = (hour: number, startRow: number, startCol: number) => {
  const fireGrid = new Map<string, number>()
  const queue = [{ row: startRow, col: startCol, ignitionHour: 0 }]
  const processed = new Set<string>()

  while (queue.length > 0) {
    const current = queue.shift()!
    const key = `${current.row},${current.col}`

    if (processed.has(key) || current.ignitionHour > hour) continue
    processed.add(key)
    fireGrid.set(key, current.ignitionHour)

    // Moore neighbors (8-directional)
    const neighbors = [
      { row: current.row - 1, col: current.col - 1 }, // NW
      { row: current.row - 1, col: current.col }, // N
      { row: current.row - 1, col: current.col + 1 }, // NE
      { row: current.row, col: current.col - 1 }, // W
      { row: current.row, col: current.col + 1 }, // E (wind direction)
      { row: current.row + 1, col: current.col - 1 }, // SW
      { row: current.row + 1, col: current.col }, // S (uphill)
      { row: current.row + 1, col: current.col + 1 }, // SE
    ]

    neighbors.forEach((neighbor, index) => {
      if (neighbor.row >= 0 && neighbor.row < GRID_SIZE && neighbor.col >= 0 && neighbor.col < GRID_SIZE) {
        const neighborKey = `${neighbor.row},${neighbor.col}`
        if (!processed.has(neighborKey)) {
          // Spread rate modifiers based on wind and terrain
          let spreadDelay = 1 // Base 1 hour spread

          // Wind effect (NE direction)
          if (index === 2 || index === 4) spreadDelay = 0.5 // NE and E faster
          if (index === 0 || index === 3) spreadDelay = 1.5 // NW and W slower

          // Slope effect (uphill faster)
          if (index === 6 || index === 7) spreadDelay *= 0.8 // S and SE uphill

          const ignitionTime = current.ignitionHour + spreadDelay
          if (ignitionTime <= hour) {
            queue.push({ row: neighbor.row, col: neighbor.col, ignitionHour: Math.floor(ignitionTime) })
          }
        }
      }
    })
  }

  return fireGrid
}

export function GridSimulation() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const fireLayerRef = useRef<any>(null)
  const [currentHour, setCurrentHour] = useState([0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [startCell] = useState({ row: 5, col: 6 }) // Bair Bagar area
  const [fireGrid, setFireGrid] = useState(new Map<string, number>())
  const [activeCells, setActiveCells] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!).setView(CHAMOLI_CENTER, 11)

      // Add terrain tiles
      L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenTopoMap contributors",
        maxZoom: 17,
      }).addTo(map)

      mapInstanceRef.current = map
      setIsMapLoaded(true)

      // Add fire origin marker
      const originLat = CHAMOLI_CENTER[0] - 0.1 + startCell.row * 0.02
      const originLng = CHAMOLI_CENTER[1] - 0.1 + startCell.col * 0.02

      L.marker([originLat, originLng], {
        icon: L.divIcon({
          className: "fire-origin-marker",
          html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; animation: pulse 2s infinite;"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      })
        .addTo(map)
        .bindPopup("Fire Origin - Bair Bagar Area")
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Auto-play simulation
  useEffect(() => {
    if (isPlaying && currentHour[0] < 6) {
      const interval = setInterval(() => {
        setCurrentHour((prev) => [Math.min(prev[0] + 0.5, 6)])
      }, 1000)
      return () => clearInterval(interval)
    } else if (currentHour[0] >= 6) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentHour])

  // Update fire simulation
  useEffect(() => {
    const newFireGrid = simulateFireSpread(currentHour[0], startCell.row, startCell.col)
    setFireGrid(newFireGrid)
    setActiveCells(newFireGrid.size)
  }, [currentHour, startCell])

  // Update fire visualization on map
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    const updateFireVisualization = async () => {
      const L = (await import("leaflet")).default

      // Remove existing fire layer
      if (fireLayerRef.current) {
        mapInstanceRef.current.removeLayer(fireLayerRef.current)
      }

      // Create new fire layer
      const fireLayer = L.layerGroup()

      const startLat = CHAMOLI_CENTER[0] - 0.1
      const startLng = CHAMOLI_CENTER[1] - 0.1
      const latStep = 0.02
      const lngStep = 0.02

      fireGrid.forEach((ignitionHour, key) => {
        const [row, col] = key.split(",").map(Number)
        const lat = startLat + row * latStep
        const lng = startLng + col * lngStep

        const bounds = [
          [lat - 0.01, lng - 0.01],
          [lat + 0.01, lng + 0.01],
        ] as [[number, number], [number, number]]

        const color = getFireColor(ignitionHour)
        const opacity = Math.max(0.6, 1 - ignitionHour * 0.1)

        const rectangle = L.rectangle(bounds, {
          color: color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 2,
          className: `fire-cell-${ignitionHour}`,
        })

        // Add pulsing effect for recent fires
        if (ignitionHour >= currentHour[0] - 1) {
          rectangle.setStyle({ className: "fire-cell-active" })
        }

        fireLayer.addLayer(rectangle)
      })

      fireLayer.addTo(mapInstanceRef.current)
      fireLayerRef.current = fireLayer
    }

    updateFireVisualization()
  }, [fireGrid, currentHour, isMapLoaded])

  const getFireColor = (hour: number) => {
    if (hour === 0) return "#dc2626" // Red for origin
    if (hour <= 1) return "#ea580c" // Orange-red
    if (hour <= 2) return "#f97316" // Orange
    if (hour <= 3) return "#eab308" // Yellow
    if (hour <= 4) return "#84cc16" // Yellow-green
    return "#22c55e" // Green for older burns
  }

  const resetSimulation = () => {
    setCurrentHour([0])
    setIsPlaying(false)
    setFireGrid(new Map())
    setActiveCells(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 text-slate-900 p-6">
      {/* Add Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .fire-origin-marker {
          animation: pulse 2s infinite;
        }
        .fire-cell-active {
          animation: pulse 1.5s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {/* Enhanced Header with Real-time HUD */}
        <div className="text-center space-y-2 relative">
          <h1 className="text-3xl font-bold text-slate-900 mission-control-font">FIRE SPREAD GRID SIMULATION</h1>
          <p className="text-slate-700">Moore neighborhood logic with terrain-aware spread modeling</p>
          <Badge variant="outline" className="border-red-400 text-red-400 mission-control-font">
            SIMULATION ACTIVE - BAIR BAGAR ORIGIN
          </Badge>

          {/* Real-time HUD - Top Right */}
          <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm border border-slate-300 rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-2 gap-2 text-xs mission-control-font">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-slate-700">🛰️ SAT-LINK: Active</span>
              </div>
              <div className="text-slate-700">💨 Wind: 18 km/h NE</div>
              <div className="text-slate-700">🌡️ Temp: 32°C | RH: 34%</div>
              <div className="text-slate-700">
                🕒 Time: {currentHour[0]}h {Math.round((currentHour[0] % 1) * 60)}m
              </div>
              <div className="text-slate-700">🔥 Active Cells: {activeCells}</div>
              <div className="text-slate-700">
                🧍‍♂️ Villages Affected: {currentHour[0] >= 2 ? 3 : currentHour[0] >= 1 ? 1 : 0}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="space-y-4">
            <Card className="bg-white border-black shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 mission-control-font">SIMULATION CONTROLS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-700 mission-control-font">TIMELINE</label>
                    <Badge variant="outline" className="text-white mission-control-font">
                      {currentHour[0]}H
                    </Badge>
                  </div>
                  <Slider value={currentHour} onValueChange={setCurrentHour} max={6} step={0.5} className="w-full" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1 mission-control-font">
                    <span>0H</span>
                    <span>3H</span>
                    <span>6H</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant={isPlaying ? "destructive" : "default"}
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex-1 mission-control-font"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "PAUSE" : "PLAY"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSimulation}
                    className="mission-control-font bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 mission-control-font mb-2"
                  onClick={() => {
                    // Auto-select highest risk cell
                    setCurrentHour([0])
                    setIsPlaying(false)
                    // Mock high-risk cell selection
                  }}
                >
                  🎯 START FROM HIGH-RISK ZONE
                </Button>

                <div className="p-3 bg-slate-100 rounded-lg border border-black">
                  <p className="text-sm text-slate-700 mission-control-font">FIRE CENTER</p>
                  <p className="text-lg font-bold text-red-600 mission-control-font">
                    BAIR BAGAR [{startCell.col}, {startCell.row}]
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Live Stats */}
            <Card className="bg-white border-black shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 mission-control-font flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>LIVE STATS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 mission-control-font">CELLS BURNING</span>
                  <span className="text-red-600 font-bold mission-control-font text-xl">{activeCells}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 mission-control-font">SPREAD DIRECTION</span>
                  <span className="text-slate-900 font-bold mission-control-font">NE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 mission-control-font">TOTAL AREA</span>
                  <span className="text-slate-900 font-bold mission-control-font">
                    {Math.round(activeCells * 4)} km²
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 mission-control-font">VILLAGES AFFECTED</span>
                  <span className="text-orange-400 font-bold mission-control-font">
                    {currentHour[0] >= 2 ? 3 : currentHour[0] >= 1 ? 1 : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Factors */}
            <Card className="bg-white border-black shadow-lg">
              <CardHeader>
                <CardTitle className="text-white mission-control-font">ENVIRONMENTAL FACTORS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-700 mission-control-font">WIND</span>
                  </div>
                  <span className="text-slate-900 font-bold mission-control-font">18 km/h ➡️ NE</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <span className="text-slate-700 mission-control-font">TEMP</span>
                  </div>
                  <span className="text-slate-900 font-bold mission-control-font">32°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mountain className="w-4 h-4 text-green-400" />
                    <span className="text-slate-700 mission-control-font">TERRAIN</span>
                  </div>
                  <span className="text-slate-900 font-bold mission-control-font">MODERATE SLOPE</span>
                </div>
              </CardContent>
            </Card>

            {/* Live Forecast Stats Panel */}
            <Card className="bg-white border-slate-300 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 mission-control-font text-sm">📊 LIVE FORECAST</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs mission-control-font">
                  <div className="grid grid-cols-3 gap-1 text-slate-600 font-bold mb-1">
                    <span>Hour</span>
                    <span>Cells</span>
                    <span>Area km²</span>
                  </div>
                  {[1, 2, 3, 6].map((hour) => (
                    <div
                      key={hour}
                      className={`grid grid-cols-3 gap-1 ${currentHour[0] >= hour ? "text-red-600 font-bold" : "text-slate-500"}`}
                    >
                      <span>{hour}</span>
                      <span>{Math.round(Math.pow(hour + 1, 1.8) * 3)}</span>
                      <span>{Math.round(Math.pow(hour + 1, 1.8) * 3 * 4)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-16 bg-slate-100 rounded flex items-end justify-around p-1">
                  {[1, 2, 3, 6].map((hour) => (
                    <div
                      key={hour}
                      className={`w-6 bg-gradient-to-t from-red-500 to-orange-400 rounded-t ${currentHour[0] >= hour ? "opacity-100" : "opacity-30"}`}
                      style={{ height: `${Math.min(hour * 8, 48)}px` }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Map Simulation */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-black shadow-lg">
              <CardHeader>
                <CardTitle className="text-white mission-control-font">FIRE SPREAD EVOLUTION</CardTitle>
                <p className="text-slate-400 text-sm">
                  Real-time terrain-based fire propagation using Moore neighborhood logic
                </p>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  className="w-full h-96 rounded-lg border border-slate-600"
                  style={{ minHeight: "400px" }}
                />

                <div className="mt-4 flex justify-between text-xs text-slate-400 mission-control-font">
                  <span>SIMULATION TIME: {currentHour[0]} HOURS</span>
                  <span>SPREAD MODEL: MOORE (8-DIRECTIONAL)</span>
                  <span>WIND FACTOR: +100% NE</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Progress */}
            <div className="grid grid-cols-7 gap-4 mt-4">
              {[0, 1, 2, 3, 4, 5, 6].map((hour) => (
                <Card
                  key={hour}
                  className={`bg-white border-black shadow-lg ${
                    currentHour[0] >= hour ? "border-red-500 border-2" : ""
                  } transition-all`}
                >
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-slate-700 mission-control-font">HOUR {hour}</p>
                    <p className="text-lg font-bold text-red-600 mission-control-font">
                      {currentHour[0] >= hour ? Math.round(Math.pow(hour + 1, 1.8) * 3) : 0}
                    </p>
                    <p className="text-xs text-slate-500">CELLS</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2 text-xs mission-control-font">
          <div className="bg-blue-50 border border-blue-200 rounded-full px-2 py-1 text-blue-700">
            🔄 Last Satellite Sync: 6 mins ago
          </div>
          <div className="bg-green-50 border border-green-200 rounded-full px-2 py-1 text-green-700">
            Model: Moore 8-Neighborhood | Terrain-aware | Wind-adjusted
          </div>
        </div>
      </div>
    </div>
  )
}

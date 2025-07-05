"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, MapPin, Wind, Thermometer, Droplets } from "lucide-react"

// Chamoli district center coordinates
const CHAMOLI_CENTER = [30.4167, 79.3167] as [number, number]
const GRID_SIZE = 20
const STEP_INTERVAL = 500 // ms

interface Cell {
  row: number
  col: number
  burning: boolean
}

const createInitialGrid = (origin?: { row: number; col: number }): Cell[][] => {
  return Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => ({
      row: r,
      col: c,
      burning: origin ? r === origin.row && c === origin.col : false,
    })),
  )
}

export function EnhancedGridSimulation() {
  // try to load the origin from sessionStorage
  const stored = typeof window !== "undefined" ? sessionStorage.getItem("simulationStartCell") : null
  const origin = stored ? (JSON.parse(stored) as { startCell: { row: number; col: number } }) : null

  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid(origin?.startCell))
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)

  const timer = useRef<NodeJS.Timeout | null>(null)

  // spread algorithm: ignite any non-burning neighbour of a burning cell
  const spread = useCallback((current: Cell[][]): Cell[][] => {
    const next = current.map((row) => row.map((cell) => ({ ...cell })))
    current.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!cell.burning) return
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = r + dr
            const nc = c + dc
            if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue
            next[nr][nc].burning = true
          }
        }
      }),
    )
    return next
  }, [])

  // run the simulation loop
  useEffect(() => {
    if (!running) return
    timer.current = setInterval(() => {
      setGrid((prev) => spread(prev))
      setStep((prev) => prev + 1)
    }, STEP_INTERVAL)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [running, spread])

  const burningCount = grid.flat().filter((c) => c.burning).length

  const reset = () => {
    if (timer.current) clearInterval(timer.current)
    setGrid(createInitialGrid(origin?.startCell))
    setStep(0)
    setRunning(false)
  }

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const fireLayerRef = useRef<any>(null)
  const [currentHour, setCurrentHour] = useState([0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [startCell, setStartCell] = useState({ row: 5, col: 6 })
  const [fireGrid, setFireGrid] = useState(new Map<string, { ignitionHour: number; intensity: number }>())
  const [activeCells, setActiveCells] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<any>(null)
  const [simulationData, setSimulationData] = useState<any>(null)

  // Village data with alert status
  const villageAlerts = [
    { name: "Bair Bagar", lat: 30.2833, lng: 79.1833, eta: "20 mins", status: "🔴", affected: true },
    { name: "Tapovan", lat: 30.4333, lng: 79.3, eta: "1h 45m", status: "🟠", affected: false },
    { name: "Pindawali", lat: 30.3167, lng: 79.4, eta: "2h 30m", status: "🟡", affected: false },
  ]

  // Initialize enhanced map with terrain tiles
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import("leaflet")).default

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!).setView(CHAMOLI_CENTER, 11)

      // Enhanced terrain tiles
      L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenTopoMap contributors",
        maxZoom: 17,
      }).addTo(map)

      mapInstanceRef.current = map
      setIsMapLoaded(true)

      // Add fire origin with enhanced marker
      const originLat = CHAMOLI_CENTER[0] - 0.1 + startCell.row * 0.02
      const originLng = CHAMOLI_CENTER[1] - 0.1 + startCell.col * 0.02

      L.marker([originLat, originLng], {
        icon: L.divIcon({
          className: "fire-origin-marker",
          html: '<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .addTo(map)
        .bindPopup("🔥 Fire Origin - Bair Bagar Area")

      // Add village markers with floating alert badges
      villageAlerts.forEach((village) => {
        L.marker([village.lat, village.lng], {
          icon: L.divIcon({
            className: "village-alert-marker",
            html: `
              <div style="position: relative;">
                <div style="background: white; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #374151;"></div>
                <div style="position: absolute; top: -25px; left: -30px; background: rgba(255,255,255,0.95); border: 1px solid #d1d5db; border-radius: 8px; padding: 2px 6px; font-size: 10px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${village.name} ${village.status} ETA: ${village.eta}
                </div>
              </div>
            `,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          }),
        }).addTo(map)
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [startCell])

  // Auto-play simulation
  useEffect(() => {
    if (isPlaying && currentHour[0] < 6) {
      const interval = setInterval(() => {
        setCurrentHour((prev) => [Math.min(prev[0] + 0.1, 6)])
      }, 200)
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

  // Enhanced fire visualization with fading overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    const updateFireVisualization = async () => {
      const L = (await import("leaflet")).default

      if (fireLayerRef.current) {
        mapInstanceRef.current.removeLayer(fireLayerRef.current)
      }

      const fireLayer = L.layerGroup()
      const startLat = CHAMOLI_CENTER[0] - 0.1
      const startLng = CHAMOLI_CENTER[1] - 0.1
      const latStep = 0.02
      const lngStep = 0.02

      fireGrid.forEach((fireData, key) => {
        const [row, col] = key.split(",").map(Number)
        const lat = startLat + row * latStep
        const lng = startLng + col * lngStep

        const bounds = [
          [lat - 0.01, lng - 0.01],
          [lat + 0.01, lng + 0.01],
        ] as [[number, number], [number, number]]

        // Enhanced fire colors with intensity
        const { color, opacity } = getEnhancedFireColor(fireData.ignitionHour, fireData.intensity)

        const rectangle = L.rectangle(bounds, {
          color: color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 2,
          className: `fire-cell-static fire-hour-${Math.floor(fireData.ignitionHour)}`,
        })

        // Enhanced hover effects
        rectangle.on("mouseover", (e) => {
          setHoveredCell({
            cellId: `[${col},${row}]`,
            ignitionHour: fireData.ignitionHour.toFixed(1),
            intensity: (fireData.intensity * 100).toFixed(0),
            burnStatus: fireData.ignitionHour <= currentHour[0] ? "Burning" : "Predicted",
          })
          rectangle.setStyle({ weight: 3, color: "#ffffff" })
        })

        rectangle.on("mouseout", (e) => {
          setHoveredCell(null)
          rectangle.setStyle({ weight: 1, color: color })
        })

        fireLayer.addLayer(rectangle)
      })

      // Add evacuation zones after 3 hours
      if (currentHour[0] >= 3) {
        villageAlerts.forEach((village) => {
          if (village.affected) {
            L.circle([village.lat, village.lng], {
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.15,
              radius: 3000,
              weight: 2,
              dashArray: "10, 5",
              className: "evacuation-zone-static",
            }).addTo(fireLayer)
          }
        })
      }

      fireLayer.addTo(mapInstanceRef.current)
      fireLayerRef.current = fireLayer
    }

    updateFireVisualization()
  }, [fireGrid, currentHour, isMapLoaded])

  const getEnhancedFireColor = (hour: number, intensity: number) => {
    const baseOpacity = Math.max(0.3, intensity * 0.8)

    if (hour === 0) return { color: "#e11d48", opacity: 0.9 } // Modern red
    if (hour <= 1) return { color: "#ea580c", opacity: baseOpacity * 0.8 } // Modern orange
    if (hour <= 2) return { color: "#f59e0b", opacity: baseOpacity * 0.7 } // Modern amber
    if (hour <= 3) return { color: "#eab308", opacity: baseOpacity * 0.6 } // Modern yellow
    if (hour <= 4) return { color: "#84cc16", opacity: baseOpacity * 0.5 } // Modern lime
    return { color: "#10b981", opacity: baseOpacity * 0.4 } // Modern emerald
  }

  const resetSimulation = () => {
    setCurrentHour([0])
    setIsPlaying(false)
    setFireGrid(new Map())
    setActiveCells(0)
  }

  const startFromHighRisk = () => {
    // Mock high-risk cell selection
    setStartCell({ row: 3, col: 7 })
    setCurrentHour([0])
    setIsPlaying(false)
  }

  useEffect(() => {
    // Check for stored simulation data
    const storedData = sessionStorage.getItem("simulationStartCell")
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        console.log("Loading simulation data:", data)
        setSimulationData(data)

        if (data.startCell) {
          setStartCell(data.startCell)
        }

        // Clear the stored data after using it
        sessionStorage.removeItem("simulationStartCell")
      } catch (error) {
        console.error("Error parsing simulation data:", error)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 text-slate-900 p-3 sm:p-6">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />

      {/* Enhanced Header with Real-time HUD */}
      <div className="text-center space-y-4 relative mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold text-red-600">FIRE SPREAD GRID SIMULATION</h1>
        <p className="text-slate-600">Moore neighborhood logic with terrain-aware spread modeling</p>
        <Badge variant="destructive" className="animate-pulse">
          🔥 SIMULATION ACTIVE - BAIR BAGAR ORIGIN
        </Badge>

        {/* Real-time HUD - Top Right */}
        <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>🛰️ SAT-LINK: Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="w-3 h-3" />
              <span>18 km/h NE</span>
            </div>
            <div className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3" />
              <span>32°C</span>
            </div>
            <div className="flex items-center space-x-1">
              <Droplets className="w-3 h-3" />
              <span>RH: 34%</span>
            </div>
            <div>🕒 Time: {currentHour[0].toFixed(1)}h</div>
            <div>🔥 Active: {activeCells}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Enhanced Map Section */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] sm:h-[600px] overflow-hidden shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>Chamoli District - Fire Spread Visualization</span>
                </span>
                <Badge variant="outline" className="text-xs">
                  Origin: [{startCell.col}, {startCell.row}]
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <div ref={mapRef} className="w-full h-full rounded-b-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Control Panel */}
        <div className="space-y-4">
          {/* Simulation Controls */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Simulation Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time: {currentHour[0].toFixed(1)} hours</label>
                <Slider value={currentHour} onValueChange={setCurrentHour} max={6} step={0.1} className="w-full" />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant={isPlaying ? "destructive" : "default"}
                  size="sm"
                  className="flex-1"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={resetSimulation} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={startFromHighRisk} variant="secondary" size="sm" className="w-full">
                Start from High-Risk Cell
              </Button>
            </CardContent>
          </Card>

          {/* Fire Statistics */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Fire Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-red-50 p-2 rounded">
                  <div className="font-semibold text-red-700">Active Cells</div>
                  <div className="text-xl font-bold text-red-600">{activeCells}</div>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <div className="font-semibold text-orange-700">Burn Rate</div>
                  <div className="text-xl font-bold text-orange-600">
                    {currentHour[0] > 0 ? (activeCells / currentHour[0]).toFixed(1) : "0"}/hr
                  </div>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="font-semibold text-yellow-700">Area (km²)</div>
                  <div className="text-xl font-bold text-yellow-600">{(activeCells * 0.04).toFixed(2)}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-semibold text-green-700">Containment</div>
                  <div className="text-xl font-bold text-green-600">
                    {currentHour[0] >= 6 ? "100%" : Math.min(100, (currentHour[0] / 6) * 100).toFixed(0) + "%"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Village Alerts */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Village Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {villageAlerts.map((village, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border-l-4 ${
                    village.status === "🔴"
                      ? "border-red-500 bg-red-50"
                      : village.status === "🟠"
                        ? "border-orange-500 bg-orange-50"
                        : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm">{village.name}</div>
                      <div className="text-xs text-slate-600">ETA: {village.eta}</div>
                    </div>
                    <div className="text-lg">{village.status}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cell Hover Info */}
          {hoveredCell && (
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Cell Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Cell ID:</strong> {hoveredCell.cellId}
                </div>
                <div>
                  <strong>Ignition Hour:</strong> {hoveredCell.ignitionHour}h
                </div>
                <div>
                  <strong>Intensity:</strong> {hoveredCell.intensity}%
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge variant={hoveredCell.burnStatus === "Burning" ? "destructive" : "secondary"}>
                    {hoveredCell.burnStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Grid */}
        <div
          className="grid bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rIdx) =>
            row.map((cell) => (
              <div
                key={`${cell.row}-${cell.col}`}
                className={`aspect-square border border-white/10 flex items-center justify-center text-xs ${cell.burning ? "bg-red-600 text-white animate-pulse" : rIdx % 2 === cell.col % 2 ? "bg-gray-50/30 dark:bg-slate-700/30" : ""}`}
              >
                {cell.burning ? "🔥" : ""}
              </div>
            )),
          )}
        </div>
      </div>

      {/* Enhanced Legend */}
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Fire Spread Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-rose-600 rounded"></div>
              <span>Origin (0h)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span>1-2 hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span>2-3 hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>3-4 hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-lime-500 rounded"></div>
              <span>4-5 hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span>5-6 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const simulateFireSpread = (hour: number, startRow: number, startCol: number) => {
  const fireGrid = new Map<string, { ignitionHour: number; intensity: number }>()
  const queue = [{ row: startRow, col: startCol, ignitionHour: 0, intensity: 1.0 }]
  const processed = new Set<string>()

  while (queue.length > 0) {
    const current = queue.shift()!
    const key = `${current.row},${current.col}`

    if (processed.has(key) || current.ignitionHour > hour) continue
    processed.add(key)
    fireGrid.set(key, { ignitionHour: current.ignitionHour, intensity: current.intensity })

    // Moore neighbors with irregular spread patterns
    const neighbors = [
      { row: current.row - 1, col: current.col - 1, windFactor: 0.8 }, // NW
      { row: current.row - 1, col: current.col, windFactor: 0.9 }, // N
      { row: current.row - 1, col: current.col + 1, windFactor: 0.5 }, // NE (wind direction)
      { row: current.row, col: current.col - 1, windFactor: 1.2 }, // W
      { row: current.row, col: current.col + 1, windFactor: 0.4 }, // E (strong wind)
      { row: current.row + 1, col: current.col - 1, windFactor: 1.1 }, // SW
      { row: current.row + 1, col: current.col, windFactor: 0.9 }, // S
      { row: current.row + 1, col: current.col + 1, windFactor: 0.6 }, // SE
    ]

    neighbors.forEach((neighbor) => {
      if (neighbor.row >= 0 && neighbor.row < GRID_SIZE && neighbor.col >= 0 && neighbor.col < GRID_SIZE) {
        const neighborKey = `${neighbor.row},${neighbor.col}`
        if (!processed.has(neighborKey)) {
          // Enhanced spread calculation with terrain and wind
          let spreadDelay = neighbor.windFactor
          const terrainFactor = Math.random() * 0.3 + 0.8 // 0.8-1.1 terrain variation
          const vegetationFactor = Math.random() * 0.4 + 0.8 // 0.8-1.2 vegetation variation

          spreadDelay *= terrainFactor * vegetationFactor

          const ignitionTime = current.ignitionHour + spreadDelay
          const newIntensity = Math.max(0.3, current.intensity - ignitionTime * 0.1)

          if (ignitionTime <= hour) {
            queue.push({
              row: neighbor.row,
              col: neighbor.col,
              ignitionHour: ignitionTime,
              intensity: newIntensity,
            })
          }
        }
      }
    })
  }

  return fireGrid
}

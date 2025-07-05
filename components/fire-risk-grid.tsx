"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Thermometer, Wind, Droplets, Mountain, Play, Grid3X3 } from "lucide-react"

// Chamoli district center coordinates
const CHAMOLI_CENTER = [30.4167, 79.3167] as [number, number]
const GRID_SIZE = 10
const CELL_SIZE_KM = 2

// Real villages in Chamoli district with actual coordinates
const chamoliVillages = [
  { name: "Bair Bagar", lat: 30.2833, lng: 79.1833, risk: 72, population: 847 },
  { name: "Gadora", lat: 30.35, lng: 79.25, risk: 58, population: 623 },
  { name: "Tapovan", lat: 30.4333, lng: 79.3, risk: 45, population: 1205 },
  { name: "Pindawali", lat: 30.3167, lng: 79.4, risk: 63, population: 934 },
  { name: "Joshimath", lat: 30.5556, lng: 79.5639, risk: 38, population: 2847 },
]

// Generate grid data with realistic fire risk based on terrain
const generateGridData = () => {
  const grid = []
  const startLat = CHAMOLI_CENTER[0] - 0.1
  const startLng = CHAMOLI_CENTER[1] - 0.1
  const latStep = 0.02
  const lngStep = 0.02

  for (let row = 0; row < GRID_SIZE; row++) {
    const gridRow = []
    for (let col = 0; col < GRID_SIZE; col++) {
      const lat = startLat + row * latStep
      const lng = startLng + col * lngStep

      // Simulate realistic fire risk based on elevation and vegetation
      const baseRisk = Math.floor(Math.random() * 40) + 30
      const elevationFactor = Math.random() * 20
      const vegetationFactor = Math.random() * 30
      const risk = Math.min(100, baseRisk + elevationFactor + vegetationFactor)

      gridRow.push({
        row,
        col,
        lat,
        lng,
        risk: Math.floor(risk),
        vegetation: Math.random() > 0.7 ? "Pine" : Math.random() > 0.5 ? "Oak" : "Mixed",
        elevation: Math.floor(Math.random() * 1000) + 1200,
        windSpeed: 15 + Math.random() * 10,
        slope: Math.random() > 0.6 ? "Steep" : Math.random() > 0.3 ? "Moderate" : "Gentle",
        weatherRisk: Math.floor(Math.random() * 30) + 20,
      })
    }
    grid.push(gridRow)
  }
  return grid
}

export function FireRiskGrid() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const gridLayerRef = useRef<any>(null)
  const weatherLayerRef = useRef<any>(null)
  const vegetationLayerRef = useRef<any>(null)
  const slopeLayerRef = useRef<any>(null)

  const [gridData] = useState(generateGridData())
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [showWeatherLayer, setShowWeatherLayer] = useState(true)
  const [showVegetationLayer, setShowVegetationLayer] = useState(true)
  const [showSlopeLayer, setShowSlopeLayer] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Add state for detailed tooltip
  const [detailedTooltip, setDetailedTooltip] = useState<any>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import("leaflet")).default

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Create map
      const map = L.map(mapRef.current!).setView(CHAMOLI_CENTER, 11)

      // Add terrain tiles
      L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenTopoMap contributors",
        maxZoom: 17,
      }).addTo(map)

      mapInstanceRef.current = map
      setIsMapLoaded(true)

      // Add village markers
      chamoliVillages.forEach((village) => {
        const marker = L.marker([village.lat, village.lng])
          .addTo(map)
          .bindPopup(`
            <div class="text-sm">
              <strong>${village.name}</strong><br/>
              Population: ${village.population}<br/>
              Fire Risk: ${village.risk}%
            </div>
          `)
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update all layers when controls change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return
    updateAllLayers()
  }, [showWeatherLayer, showVegetationLayer, showSlopeLayer, isMapLoaded, selectedCell])

  const updateAllLayers = async () => {
    const L = (await import("leaflet")).default

    // Remove existing layers
    if (gridLayerRef.current) mapInstanceRef.current.removeLayer(gridLayerRef.current)
    if (weatherLayerRef.current) mapInstanceRef.current.removeLayer(weatherLayerRef.current)
    if (vegetationLayerRef.current) mapInstanceRef.current.removeLayer(vegetationLayerRef.current)
    if (slopeLayerRef.current) mapInstanceRef.current.removeLayer(slopeLayerRef.current)

    // Create base grid layer
    const gridLayer = L.layerGroup()

    // Create overlay layers
    const weatherLayer = L.layerGroup()
    const vegetationLayer = L.layerGroup()
    const slopeLayer = L.layerGroup()

    gridData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const bounds = [
          [cell.lat - 0.01, cell.lng - 0.01],
          [cell.lat + 0.01, cell.lng + 0.01],
        ] as [[number, number], [number, number]]

        // Base grid with fire risk
        const baseColor = getRiskColor(cell.risk)
        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex

        const baseRectangle = L.rectangle(bounds, {
          color: isSelected ? "#ffffff" : baseColor,
          fillColor: baseColor,
          fillOpacity: 0.6,
          weight: isSelected ? 4 : 2,
          className: `grid-cell-${rowIndex}-${colIndex}`,
        })

        // Weather layer overlay
        if (showWeatherLayer) {
          const weatherIntensity = cell.weatherRisk / 100
          const weatherRect = L.rectangle(bounds, {
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: weatherIntensity * 0.4,
            weight: 1,
            className: "weather-overlay",
          })
          weatherLayer.addLayer(weatherRect)
        }

        // Vegetation layer overlay
        if (showVegetationLayer) {
          const vegColor = getVegetationColor(cell.vegetation)
          const vegRect = L.rectangle(bounds, {
            color: vegColor,
            fillColor: vegColor,
            fillOpacity: 0.3,
            weight: 1,
            className: "vegetation-overlay",
          })
          vegetationLayer.addLayer(vegRect)
        }

        // Slope layer overlay
        if (showSlopeLayer) {
          const slopeColor = getSlopeColor(cell.slope)
          const slopeRect = L.rectangle(bounds, {
            color: slopeColor,
            fillColor: slopeColor,
            fillOpacity: 0.4,
            weight: 1,
            className: "slope-overlay",
          })
          slopeLayer.addLayer(slopeRect)
        }

        // Enhanced hover and click events
        baseRectangle.on("mouseover", (e) => {
          setHoveredCell(cell)
          setDetailedTooltip({
            cellId: `[${colIndex},${rowIndex}]`,
            riskIndex: cell.risk,
            vegetation: cell.vegetation,
            slope: cell.slope,
            elevation: cell.elevation,
            windSpeed: cell.windSpeed.toFixed(1),
            weatherRisk: cell.weatherRisk,
            predictedIgnition: calculateIgnitionTime(cell),
          })
          baseRectangle.setStyle({ weight: 3, color: "#ffffff" })
        })

        baseRectangle.on("mouseout", (e) => {
          setHoveredCell(null)
          setDetailedTooltip(null)
          if (!isSelected) {
            baseRectangle.setStyle({ weight: 2, color: baseColor })
          }
        })

        baseRectangle.on("click", (e) => {
          setSelectedCell({ row: rowIndex, col: colIndex })
          // Trigger map update to show selection
          setTimeout(() => updateAllLayers(), 100)
        })

        gridLayer.addLayer(baseRectangle)
      })
    })

    // Add layers to map in correct order
    gridLayer.addTo(mapInstanceRef.current)
    if (showWeatherLayer) weatherLayer.addTo(mapInstanceRef.current)
    if (showVegetationLayer) vegetationLayer.addTo(mapInstanceRef.current)
    if (showSlopeLayer) slopeLayer.addTo(mapInstanceRef.current)

    // Store layer references
    gridLayerRef.current = gridLayer
    weatherLayerRef.current = weatherLayer
    vegetationLayerRef.current = vegetationLayer
    slopeLayerRef.current = slopeLayer
  }

  const calculateIgnitionTime = (cell: any) => {
    const baseTime = 120 - cell.risk // Higher risk = faster ignition
    const slopeModifier = cell.slope === "Steep" ? -30 : cell.slope === "Moderate" ? -10 : 0
    const vegModifier = cell.vegetation === "Pine" ? -20 : cell.vegetation === "Oak" ? -10 : 0
    const weatherModifier = cell.weatherRisk > 50 ? -15 : 0

    const totalMinutes = Math.max(15, baseTime + slopeModifier + vegModifier + weatherModifier)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 65) return "#e11d48" // Modern red
    if (risk >= 40) return "#f59e0b" // Modern amber
    return "#eab308" // Modern yellow
  }

  const getVegetationColor = (vegetation: string) => {
    switch (vegetation) {
      case "Pine":
        return "#059669" // Emerald
      case "Oak":
        return "#16a34a" // Green
      default:
        return "#65a30d" // Lime
    }
  }

  const getSlopeColor = (slope: string) => {
    switch (slope) {
      case "Steep":
        return "#dc2626" // Red
      case "Moderate":
        return "#ea580c" // Orange
      default:
        return "#eab308" // Yellow
    }
  }

  const getRiskLevel = (risk: number) => {
    if (risk >= 65) return "HIGH"
    if (risk >= 40) return "MODERATE"
    return "LOW"
  }

  const startSimulation = () => {
    if (selectedCell) {
      // Store the selected cell data for the simulation
      const cellData = gridData[selectedCell.row][selectedCell.col]

      // Create a more detailed event with cell information
      const simulationData = {
        module: "grid-simulation",
        startCell: selectedCell,
        cellData: {
          risk: cellData.risk,
          vegetation: cellData.vegetation,
          slope: cellData.slope,
          elevation: cellData.elevation,
          coordinates: [cellData.lat, cellData.lng],
        },
      }

      // Dispatch the event to switch modules
      const event = new CustomEvent("switchModule", {
        detail: simulationData,
      })
      window.dispatchEvent(event)

      // Also try direct module switching as backup
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(
          {
            type: "SWITCH_MODULE",
            data: simulationData,
          },
          "*",
        )
      }

      // Console log for debugging
      console.log("Switching to simulation with data:", simulationData)
    } else {
      alert("Please select a grid cell first by clicking on the map!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 text-slate-900 p-3 sm:p-6">
      {/* Add Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mission-control-font">
            FIRE RISK PROBABILITY MAP
          </h1>
          <p className="text-sm sm:text-base text-slate-700">
            Interactive terrain analysis for Chamoli District, Uttarakhand
          </p>
          <Badge
            variant="outline"
            className="border-emerald-400 text-emerald-400 mission-control-font text-xs sm:text-sm"
          >
            REAL-TIME SATELLITE DATA ACTIVE
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Control Panel */}
          <div className="space-y-4 lg:col-span-1">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 mission-control-font flex items-center space-x-2 text-sm sm:text-base">
                  <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>GRID CONTROLS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <label className="text-xs sm:text-sm text-slate-700 mission-control-font">Weather Layer</label>
                    </div>
                    <Switch
                      checked={showWeatherLayer}
                      onCheckedChange={setShowWeatherLayer}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <label className="text-xs sm:text-sm text-slate-700 mission-control-font">Vegetation</label>
                    </div>
                    <Switch
                      checked={showVegetationLayer}
                      onCheckedChange={setShowVegetationLayer}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <label className="text-xs sm:text-sm text-slate-700 mission-control-font">Slope Layer</label>
                    </div>
                    <Switch
                      checked={showSlopeLayer}
                      onCheckedChange={setShowSlopeLayer}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </div>

                {selectedCell && (
                  <div className="p-3 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                    <p className="text-xs sm:text-sm text-emerald-700 mission-control-font font-bold">SELECTED CELL</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 mission-control-font">
                      [{selectedCell.col}, {selectedCell.row}]
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Risk:{" "}
                      <span className="font-bold text-red-600">
                        {gridData[selectedCell.row][selectedCell.col].risk}%
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Vegetation: {gridData[selectedCell.row][selectedCell.col].vegetation} | Slope:{" "}
                      {gridData[selectedCell.row][selectedCell.col].slope}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-red-600 hover:bg-red-700 mission-control-font text-xs sm:text-sm p-3 sm:p-4"
                  onClick={startSimulation}
                  disabled={!selectedCell}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />🔥 START FIRE SIMULATION FROM CELL [
                  {selectedCell?.col || "X"}, {selectedCell?.row || "Y"}]
                </Button>

                {selectedCell && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 mission-control-font text-center">
                      ✅ Cell [{selectedCell.col}, {selectedCell.row}] selected and ready for simulation
                    </p>
                  </div>
                )}

                {!selectedCell && (
                  <p className="text-xs text-slate-500 text-center mission-control-font">
                    Click any grid cell to select ignition point
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Layer Legend */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 mission-control-font text-sm sm:text-base">
                  ACTIVE LAYERS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 mission-control-font">BASE RISK LEVELS</div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
                    <span className="text-slate-700 mission-control-font text-xs sm:text-sm">HIGH (&gt;65)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded"></div>
                    <span className="text-slate-700 mission-control-font text-xs sm:text-sm">MODERATE (40-65)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded"></div>
                    <span className="text-slate-700 mission-control-font text-xs sm:text-sm">LOW (&lt;40)</span>
                  </div>
                </div>

                {showVegetationLayer && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-green-700 mission-control-font">VEGETATION</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-600 rounded"></div>
                      <span className="text-slate-700 mission-control-font text-xs sm:text-sm">Pine (High Risk)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded"></div>
                      <span className="text-slate-700 mission-control-font text-xs sm:text-sm">Oak (Medium Risk)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-lime-600 rounded"></div>
                      <span className="text-slate-700 mission-control-font text-xs sm:text-sm">Mixed (Low Risk)</span>
                    </div>
                  </div>
                )}

                {showSlopeLayer && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-orange-700 mission-control-font">SLOPE</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded"></div>
                      <span className="text-slate-700 mission-control-font text-xs sm:text-sm">
                        Steep (Fast Spread)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-600 rounded"></div>
                      <span className="text-slate-700 mission-control-font text-xs sm:text-sm">Moderate</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-600 rounded"></div>
                      <span className="text-slate-700 mission-control-font text-xs sm:text-sm">
                        Gentle (Slow Spread)
                      </span>
                    </div>
                  </div>
                )}

                {showWeatherLayer && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-blue-700 mission-control-font">WEATHER IMPACT</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded opacity-60"></div>
                      <span className="text-slate-700 mission-control-font text-xs sm:text-sm">
                        Wind & Humidity Effect
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weather Conditions */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 mission-control-font text-sm sm:text-base">
                  WEATHER CONDITIONS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    <span className="text-slate-700 mission-control-font text-xs sm:text-sm">TEMP</span>
                  </div>
                  <span className="text-slate-900 font-bold mission-control-font text-sm sm:text-base">32°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    <span className="text-slate-700 mission-control-font text-xs sm:text-sm">RH</span>
                  </div>
                  <span className="text-slate-900 font-bold mission-control-font text-sm sm:text-base">34%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                    <span className="text-slate-700 mission-control-font text-xs sm:text-sm">WIND</span>
                  </div>
                  <span className="text-slate-900 font-bold mission-control-font text-sm sm:text-base">18 km/h NE</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mountain className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span className="text-slate-700 mission-control-font text-xs sm:text-sm">TERRAIN</span>
                  </div>
                  <span className="text-slate-900 font-bold mission-control-font text-sm sm:text-base">MODERATE</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Map Display */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 mission-control-font text-sm sm:text-base">
                  CHAMOLI DISTRICT - INTERACTIVE TERRAIN MAP
                </CardTitle>
                <p className="text-slate-700 text-xs sm:text-sm">
                  Click any grid cell to select fire ignition point • Toggle layers to see different data • Hover for
                  details
                </p>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  className="w-full h-64 sm:h-80 lg:h-96 rounded-lg border border-slate-600"
                  style={{ minHeight: "300px" }}
                />
                <div className="mt-4 flex flex-col sm:flex-row justify-between text-xs text-slate-400 mission-control-font space-y-1 sm:space-y-0">
                  <span>GRID: 10x10 CELLS</span>
                  <span>RESOLUTION: 2km/CELL</span>
                  <span>COVERAGE: 20km x 20km</span>
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs text-emerald-700 mission-control-font">
                    🔄 Last Satellite Sync: 6 mins ago
                  </div>
                </div>

                {/* Enhanced Tooltip */}
                {detailedTooltip && (
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg z-10 max-w-xs">
                    <p className="text-sm font-bold text-emerald-600 mission-control-font">
                      Cell ID: {detailedTooltip.cellId}
                    </p>
                    <div className="space-y-1 text-xs mission-control-font">
                      <p className="text-slate-900">
                        Fire Risk Index: <span className="font-bold text-rose-600">{detailedTooltip.riskIndex}%</span>
                      </p>
                      <p className="text-slate-700">Vegetation: {detailedTooltip.vegetation}</p>
                      <p className="text-slate-700">Slope: {detailedTooltip.slope}</p>
                      <p className="text-slate-700">Elevation: {detailedTooltip.elevation}m</p>
                      <p className="text-slate-700">Wind Speed: {detailedTooltip.windSpeed} km/h</p>
                      <p className="text-slate-700">Weather Risk: {detailedTooltip.weatherRisk}%</p>
                      <p className="text-slate-700">
                        Predicted Ignition:{" "}
                        <span className="font-bold text-orange-600">{detailedTooltip.predictedIgnition}</span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Village Data Table */}
            <Card className="bg-white border-slate-200 shadow-lg mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 mission-control-font text-sm sm:text-base">
                  VILLAGE RISK ASSESSMENT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chamoliVillages.map((village) => (
                    <div
                      key={village.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded`}
                          style={{ backgroundColor: getRiskColor(village.risk) }}
                        ></div>
                        <div>
                          <p className="text-slate-900 font-medium mission-control-font text-sm sm:text-base">
                            {village.name}
                          </p>
                          <p className="text-slate-600 text-xs sm:text-sm mission-control-font">
                            Lat: {village.lat.toFixed(4)}, Lng: {village.lng.toFixed(4)} • Pop: {village.population}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-900 font-bold mission-control-font text-base sm:text-lg">
                          {village.risk}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs mission-control-font ${
                            village.risk >= 65
                              ? "border-red-400 text-red-400"
                              : village.risk >= 40
                                ? "border-orange-400 text-orange-400"
                                : "border-yellow-400 text-yellow-400"
                          }`}
                        >
                          {getRiskLevel(village.risk)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

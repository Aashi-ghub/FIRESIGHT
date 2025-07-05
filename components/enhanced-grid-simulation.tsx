"use client"

import { useState, useEffect, useRef } from "react"

// Chamoli district center coordinates
const CHAMOLI_CENTER = [30.4167, 79.3167] as [number, number]
const GRID_SIZE = 10

// Enhanced fire spread simulation with irregular patterns
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

export function EnhancedGridSimulation() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const fireLayerRef = useRef<any>(null)
  const [currentHour, setCurrentHour] = useState([0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [startCell, setStartCell] = useState({ row: 5, col: 6 })
  const [fireGrid, setFireGrid] = useState(new Map<string, { ignitionHour: number; intensity: number }>())
  const [activeCells, setActiveCells] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false) // Fixed initialization
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
        \

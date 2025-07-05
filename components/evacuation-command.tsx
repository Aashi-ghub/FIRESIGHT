"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Send, MapPin, Users, Route, Shield, Radio } from "lucide-react"

// Chamoli district center coordinates
const CHAMOLI_CENTER = [30.4167, 79.3167] as [number, number]

// Real villages with actual coordinates and evacuation data
const evacuationData = [
  {
    village: "Bair Bagar",
    lat: 30.2833,
    lng: 79.1833,
    distance: "2.1 km",
    eta: "30 mins",
    alertLevel: "HIGH",
    population: 847,
    status: "EVACUATING",
    lastContact: "2 mins ago",
  },
  {
    village: "Pindawali",
    lat: 30.3167,
    lng: 79.4,
    distance: "3.5 km",
    eta: "50 mins",
    alertLevel: "MODERATE",
    population: 934,
    status: "ALERTED",
    lastContact: "5 mins ago",
  },
  {
    village: "Tapovan",
    lat: 30.4333,
    lng: 79.3,
    distance: "6.8 km",
    eta: "2h 45m",
    alertLevel: "LOW",
    population: 1205,
    status: "MONITORING",
    lastContact: "12 mins ago",
  },
]

const getAlertColor = (level: string) => {
  switch (level) {
    case "HIGH":
      return "border-rose-500 bg-rose-500/10 text-rose-400"
    case "MODERATE":
      return "border-amber-500 bg-amber-500/10 text-amber-400"
    default:
      return "border-yellow-500 bg-yellow-500/10 text-yellow-400"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "EVACUATING":
      return "bg-red-600 text-white"
    case "ALERTED":
      return "bg-orange-600 text-white"
    default:
      return "bg-slate-600 text-white"
  }
}

export function EvacuationCommand() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [lastAlertTime] = useState("09:46 AM")
  const [alertsSent] = useState(3)
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

      // Add fire origin
      const fireOrigin = [30.2833, 79.1833] // Bair Bagar area
      L.marker(fireOrigin, {
        icon: L.divIcon({
          className: "fire-origin-marker",
          html: '<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; animation: pulse 2s infinite;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      })
        .addTo(map)
        .bindPopup("🔥 Fire Origin")

      // Add villages with threat assessment rings
      evacuationData.forEach((village) => {
        // Threat assessment ring
        const ringColor =
          village.alertLevel === "HIGH" ? "#ef4444" : village.alertLevel === "MODERATE" ? "#f97316" : "#eab308"
        const ringRadius = village.alertLevel === "HIGH" ? 2000 : village.alertLevel === "MODERATE" ? 1500 : 1000

        L.circle([village.lat, village.lng], {
          color: ringColor,
          fillColor: ringColor,
          fillOpacity: 0.1,
          radius: ringRadius,
          weight: 2,
          dashArray: "5, 5",
        }).addTo(map)

        // Village marker
        const markerColor =
          village.status === "EVACUATING" ? "#dc2626" : village.status === "ALERTED" ? "#ea580c" : "#6b7280"

        L.marker([village.lat, village.lng], {
          icon: L.divIcon({
            className: "village-marker",
            html: `<div style="background: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          }),
        })
          .addTo(map)
          .bindPopup(`
          <div class="text-sm">
            <strong>${village.village}</strong><br/>
            Status: ${village.status}<br/>
            ETA: ${village.eta}<br/>
            Population: ${village.population}<br/>
            Alert Level: ${village.alertLevel}
          </div>
        `)
      })

      // Add evacuation routes
      const routes = [
        // Bair Bagar to safe zone
        [
          [30.2833, 79.1833],
          [30.35, 79.1],
        ],
        // Pindawali to safe zone
        [
          [30.3167, 79.4],
          [30.4, 79.45],
        ],
        // Tapovan to safe zone
        [
          [30.4333, 79.3],
          [30.5, 79.25],
        ],
      ]

      routes.forEach((route, index) => {
        L.polyline(route, {
          color: "#22c55e",
          weight: 3,
          opacity: 0.7,
          dashArray: "10, 5",
        }).addTo(map)
      })

      // Add safe zones
      const safeZones = [
        [30.35, 79.1],
        [30.4, 79.45],
        [30.5, 79.25],
      ]

      safeZones.forEach((zone) => {
        L.marker(zone, {
          icon: L.divIcon({
            className: "safe-zone-marker",
            html: '<div style="background: #22c55e; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        })
          .addTo(map)
          .bindPopup("🛡️ Safe Zone")
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
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 mission-control-font">EVACUATION COMMAND CENTER</h1>
          <p className="text-slate-700">Real-time evacuation coordination and alert management system</p>
          <Badge variant="outline" className="border-red-400 text-red-400 mission-control-font">
            EMERGENCY PROTOCOL ACTIVE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Command Panel */}
          <div className="space-y-4">
            <Card className="bg-red-50 border-red-500 border-2 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 mission-control-font">🚨 LAST ALERT SENT</p>
                    <p className="text-lg font-bold text-red-800 mission-control-font">{lastAlertTime}</p>
                    <p className="text-xs text-red-600">TO {alertsSent} VILLAGES</p>
                  </div>
                  <Radio className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full bg-red-600 hover:bg-red-700 mission-control-font">
              <Send className="w-4 h-4 mr-2" />
              TRIGGER NEW ALERT
            </Button>

            {/* Command Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardContent className="p-3 text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <p className="text-lg font-bold text-slate-900 mission-control-font">2,986</p>
                  <p className="text-xs text-slate-600 mission-control-font">TOTAL POP</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardContent className="p-3 text-center">
                  <Route className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <p className="text-lg font-bold text-slate-900 mission-control-font">12</p>
                  <p className="text-xs text-slate-600 mission-control-font">EVAC ROUTES</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardContent className="p-3 text-center">
                  <Shield className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <p className="text-lg font-bold text-slate-900 mission-control-font">8</p>
                  <p className="text-xs text-slate-600 mission-control-font">SAFE ZONES</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardContent className="p-3 text-center">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-400" />
                  <p className="text-lg font-bold text-slate-900 mission-control-font">3</p>
                  <p className="text-xs text-slate-600 mission-control-font">ACTIVE ALERTS</p>
                </CardContent>
              </Card>
            </div>

            {/* Alert Table */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 mission-control-font">🔔 ALERT TABLE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-600 mission-control-font font-bold">
                    <span>VILLAGE</span>
                    <span>DISTANCE</span>
                    <span>ETA</span>
                    <span>RISK</span>
                  </div>
                  {evacuationData.map((item) => (
                    <div key={item.village} className="grid grid-cols-4 gap-2 text-xs mission-control-font">
                      <span className="text-slate-900">{item.village}</span>
                      <span className="text-slate-700">{item.distance}</span>
                      <span className="text-slate-700">{item.eta}</span>
                      <span
                        className={`font-bold ${
                          item.alertLevel === "HIGH"
                            ? "text-red-400"
                            : item.alertLevel === "MODERATE"
                              ? "text-orange-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {item.alertLevel === "HIGH" ? "🔴" : item.alertLevel === "MODERATE" ? "🟠" : "🟡"}{" "}
                        {item.alertLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evacuation Status and Map */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 mission-control-font">VILLAGE EVACUATION STATUS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evacuationData.map((item) => (
                    <div
                      key={item.village}
                      className={`p-4 rounded-lg border-l-4 border border-slate-200 ${
                        item.alertLevel === "HIGH"
                          ? "bg-red-50 border-l-red-500"
                          : item.alertLevel === "MODERATE"
                            ? "bg-orange-50 border-l-orange-500"
                            : "bg-yellow-50 border-l-yellow-500"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 mission-control-font text-lg">
                              {item.village}
                            </h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-sm text-slate-700 mission-control-font">ETA: {item.eta}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span className="text-sm text-slate-700 mission-control-font">
                                  {item.population} people
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="text-sm text-slate-700 mission-control-font">{item.distance}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs text-slate-600 mission-control-font">
                                Last Contact: {item.lastContact}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 mt-3 md:mt-0">
                          <Badge
                            className={`${getAlertColor(item.alertLevel)} mission-control-font text-xs md:text-base`}
                          >
                            {item.alertLevel}
                          </Badge>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold mission-control-font ${getStatusColor(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tactical Map */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 mission-control-font">TACTICAL EVACUATION MAP</CardTitle>
                <p className="text-slate-700 text-sm">
                  Real terrain with threat assessment rings and evacuation routes
                </p>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  className="w-full h-80 rounded-lg border border-slate-600 touch-none"
                  style={{ minHeight: "320px" }}
                />

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                      <span className="text-xs text-slate-600 mission-control-font">HIGH RISK</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-xs text-slate-600 mission-control-font">MODERATE</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-slate-600 mission-control-font">SAFE ZONE</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-3 h-1 bg-emerald-500"></div>
                      <span className="text-xs text-slate-600 mission-control-font">EVAC ROUTE</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-600 mission-control-font">
                    Last Alert Sent: <span className="text-red-600 font-bold">10:34 AM</span>
                  </p>
                  <Button className="mt-2 bg-red-600 hover:bg-red-700 mission-control-font">TRIGGER NEW ALERTS</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Database, Satellite, Activity, Users, AlertCircle, CheckCircle, Clock } from "lucide-react"

const systemStatus = [
  { service: "Satellite Data Feed", status: "Active", lastUpdate: "2 mins ago", icon: Satellite },
  { service: "Weather API", status: "Active", lastUpdate: "1 min ago", icon: Activity },
  { service: "Database", status: "Active", lastUpdate: "30 secs ago", icon: Database },
  { service: "Alert System", status: "Active", lastUpdate: "5 mins ago", icon: AlertCircle },
]

const recentActivity = [
  { action: "Fire risk assessment updated", time: "2 mins ago", type: "info" },
  { action: "Evacuation alert sent to Bajira", time: "15 mins ago", type: "warning" },
  { action: "Simulation completed for Sector 7", time: "32 mins ago", type: "success" },
  { action: "Weather data synchronized", time: "1 hour ago", type: "info" },
]

export function AdminPanel() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-slate-600">System management and monitoring dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Overview */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemStatus.map((service) => {
                  const Icon = service.icon
                  return (
                    <div key={service.service} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-slate-600" />
                        <div>
                          <p className="font-medium text-slate-900">{service.service}</p>
                          <p className="text-sm text-slate-500">{service.lastUpdate}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {service.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "warning"
                          ? "bg-orange-500"
                          : activity.type === "success"
                            ? "bg-green-500"
                            : "bg-blue-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources & Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Satellite Data</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Google Earth Engine integration for real-time forest monitoring
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Weather API</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    IMD weather data for temperature, humidity, and wind conditions
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Terrain Data</h3>
                  <p className="text-sm text-slate-600 mb-3">QGIS and GDAL integration for topographical analysis</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Synced
                  </Badge>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">ML Models</h3>
                  <p className="text-sm text-slate-600 mb-3">TensorFlow U-Net and XGBoost for fire prediction</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Running
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>System Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-transparent" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Sync Data Sources
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Run System Diagnostics
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                Test Alert System
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Parameters
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">CPU Usage</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "23%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Memory Usage</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "67%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Storage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Predictions</span>
                  <span className="font-bold text-slate-900">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Alerts Sent</span>
                  <span className="font-bold text-slate-900">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Accuracy Rate</span>
                  <span className="font-bold text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Uptime</span>
                  <span className="font-bold text-slate-900">99.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

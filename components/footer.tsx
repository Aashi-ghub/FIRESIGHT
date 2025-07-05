export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">FireSight</h3>
            <p className="text-sm text-slate-400 mb-4">
              Advanced forest fire prediction and evacuation system developed for ISRO's Uttarakhand monitoring
              initiative.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-fire-500 to-danger-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">🔥</span>
              </div>
              <span className="text-sm">ISRO Forest Fire Prediction System</span>
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <h3 className="text-white font-semibold mb-3">Technology Stack</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <div>• Google Earth Engine (Satellite Data)</div>
              <div>• Python, Scikit-learn, XGBoost</div>
              <div>• TensorFlow (U-Net for Deep Learning)</div>
              <div>• QGIS, GDAL, Rasterio</div>
              <div>• React, Next.js (Frontend)</div>
            </div>
          </div>

          {/* Contact & Status */}
          <div>
            <h3 className="text-white font-semibold mb-3">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-400">All Systems Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-400">Data Feed Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-400">Alert System Ready</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">Last updated: {new Date().toLocaleString()}</div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center">
          <p className="text-sm text-slate-500">
            © 2024 FireSight - ISRO Forest Fire Prediction System. Built for emergency response and forest conservation.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
        <p className="text-muted-foreground">
          This is your Smart Home dashboard. Here you can monitor and control
          all your IoT devices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Total Devices
          </div>
          <div className="text-3xl font-bold">0</div>
          <div className="text-xs text-muted-foreground mt-2">
            No devices paired yet
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Active Devices
          </div>
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-xs text-muted-foreground mt-2">
            All devices offline
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">Open Alarms</div>
          <div className="text-3xl font-bold text-red-600">0</div>
          <div className="text-xs text-muted-foreground mt-2">
            No active alarms
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">Energy Today</div>
          <div className="text-3xl font-bold text-blue-600">0</div>
          <div className="text-xs text-muted-foreground mt-2">kWh consumed</div>
        </div>
      </div>

      <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li>1. Create a home and add rooms</li>
          <li>2. Pair your ESP32 devices using device key</li>
          <li>3. Monitor real-time telemetry data</li>
          <li>4. Control devices remotely</li>
          <li>5. Track energy consumption</li>
        </ul>
      </div>
    </div>
  );
}

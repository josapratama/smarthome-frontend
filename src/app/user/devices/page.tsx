"use client";

export default function UserDevicesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Devices</h1>

      <div className="bg-card rounded-lg shadow-md p-8 text-center border border-border">
        <div className="text-6xl mb-4">📱</div>
        <h2 className="text-xl font-semibold mb-2">No Devices Yet</h2>
        <p className="text-muted-foreground mb-6">
          Start by pairing your ESP32 devices to monitor and control them.
        </p>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Add Device
        </button>
      </div>
    </div>
  );
}

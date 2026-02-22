"use client";

export default function UserAlarmsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Alarms</h1>

      <div className="bg-card rounded-lg shadow-md p-8 text-center border border-border">
        <div className="text-6xl mb-4">🚨</div>
        <h2 className="text-xl font-semibold mb-2">No Active Alarms</h2>
        <p className="text-muted-foreground">
          All systems are running normally. Alarms will appear here when
          triggered.
        </p>
      </div>
    </div>
  );
}

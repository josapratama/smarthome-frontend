import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

export interface SensorReading {
  id: number;
  metric: string;
  valueNum: number | null;
  unit: string | null;
  timestamp: string;
}

interface EnergySensorCardProps {
  readings: SensorReading[];
}

const PZEM_METRICS = [
  { metric: "voltage", label: "Tegangan", unit: "V", decimals: 1 },
  { metric: "current_a", label: "Arus", unit: "A", decimals: 3 },
  { metric: "power", label: "Daya", unit: "W", decimals: 1 },
  { metric: "energy", label: "Energi", unit: "kWh", decimals: 3 },
  { metric: "frequency", label: "Frekuensi", unit: "Hz", decimals: 1 },
  { metric: "power_factor", label: "Faktor Daya", unit: "", decimals: 2 },
];

export function EnergySensorCard({ readings }: EnergySensorCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Gauge className="h-4 w-4 text-orange-500" />
          Pembacaan Sensor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {readings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada data sensor
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PZEM_METRICS.map(({ metric, label, unit, decimals }) => {
              const r = readings.find((s) => s.metric === metric);
              return (
                <div
                  key={metric}
                  className="rounded-xl border bg-muted/30 p-4 space-y-1"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">
                    {r?.valueNum != null
                      ? `${r.valueNum.toFixed(decimals)} ${unit}`.trim()
                      : "—"}
                  </p>
                  {r?.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.timestamp).toLocaleTimeString("id-ID")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler } from "lucide-react";

interface BinHeightCardProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
  unit: string;
  desc: string;
}

export function BinHeightCard({
  value,
  onChange,
  label,
  unit,
  desc,
}: BinHeightCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-2 pt-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Ruler className="h-4 w-4 text-purple-500" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={5}
            max={500}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-32"
          />
          <Label className="text-sm text-muted-foreground">{unit}</Label>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

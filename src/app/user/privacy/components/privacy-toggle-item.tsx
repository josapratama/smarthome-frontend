"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface PrivacyToggleItemProps {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function PrivacyToggleItem({
  id,
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
}: PrivacyToggleItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

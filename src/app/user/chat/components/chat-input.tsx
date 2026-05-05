"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
}: ChatInputProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <Input
        placeholder={t("typeMessage") || "Type your message..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className="flex-1"
      />
      <Button onClick={onSend} disabled={!value.trim() || disabled}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

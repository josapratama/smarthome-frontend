import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, Plus } from "lucide-react";

interface ChannelEmptyStateProps {
  onAdd: () => void;
  noChannelsLabel: string;
  noChannelsDesc: string;
  addFirstLabel: string;
}

export function ChannelEmptyState({
  onAdd,
  noChannelsLabel,
  noChannelsDesc,
  addFirstLabel,
}: ChannelEmptyStateProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="py-12 text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Power className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{noChannelsLabel}</h3>
          <p className="text-sm text-muted-foreground mb-6">{noChannelsDesc}</p>
          <Button onClick={onAdd} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            {addFirstLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

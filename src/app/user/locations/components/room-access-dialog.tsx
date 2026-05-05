"use client";

import { useState } from "react";
import { Shield, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomPrivacySettings } from "./room-privacy-settings";
import { RoomAccessManagement } from "./room-access-management";
import { useTranslation } from "@/hooks/use-translation";

interface RoomAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
  homeId: number;
  currentPrivacy: "PUBLIC" | "PRIVATE" | "SHARED" | "RESTRICTED";
}

export function RoomAccessDialog({
  isOpen,
  onClose,
  roomId,
  roomName,
  homeId,
  currentPrivacy,
}: RoomAccessDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span>{t("accessControl")}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {roomName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="privacy">
          <TabsList className="w-full">
            <TabsTrigger value="privacy" className="flex-1 gap-2">
              <Shield className="h-4 w-4" />
              {t("privacySettings")}
            </TabsTrigger>
            <TabsTrigger value="access" className="flex-1 gap-2">
              <Users className="h-4 w-4" />
              {t("manageAccess")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="mt-4">
            <RoomPrivacySettings
              roomId={roomId}
              currentPrivacy={currentPrivacy}
            />
          </TabsContent>

          <TabsContent value="access" className="mt-4">
            <RoomAccessManagement roomId={roomId} homeId={homeId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

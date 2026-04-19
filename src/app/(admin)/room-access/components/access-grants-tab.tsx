"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/client/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

interface RoomAccessGrant {
  id: number;
  roomId: number;
  userId: number;
  accessLevel: string;
  grantedBy: number;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  room: {
    name: string;
    home: {
      name: string;
    };
  };
  user: {
    username: string;
    email: string;
  };
  grantor: {
    username: string;
  };
}

export default function RoomAccessGrantsTab() {
  const [grants, setGrants] = useState<RoomAccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchGrants = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/room-access/grants");
      setGrants(response.data.data || []);
    } catch (error: any) {
      // Silently handle 404 errors (endpoint not implemented yet)
      if (error.response?.status !== 404) {
        toast({
          title: t("error"),
          description:
            error.response?.data?.error || t("failedFetchAccessGrants"),
          variant: "destructive",
        });
      }
      console.log("Access grants fetch error:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  const revokeGrant = async (grantId: number) => {
    try {
      await api.delete(`/v1/room-access/grants/${grantId}`);
      toast({
        title: t("success"),
        description: t("accessGrantRevokedSuccess"),
      });
      fetchGrants();
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.response?.data?.error || t("failedRevokeGrant"),
        variant: "destructive",
      });
    }
  };

  const getAccessLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      OWNER: "default",
      CONTROL: "success",
      VIEW: "secondary",
      NONE: "destructive",
    };
    return <Badge variant={variants[level] || "outline"}>{level}</Badge>;
  };

  const activeGrants = grants.filter((g) => !g.revokedAt);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("accessGrants")}</h3>
            <p className="text-sm text-muted-foreground">
              {activeGrants.length} {t("activeGrants")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchGrants}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("refresh")}
            </Button>
            <Button size="sm" onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("grantAccess")}
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead>{t("room")}</TableHead>
                <TableHead>{t("home")}</TableHead>
                <TableHead>{t("accessLevel")}</TableHead>
                <TableHead>{t("grantedBy")}</TableHead>
                <TableHead>{t("grantedAt")}</TableHead>
                <TableHead>{t("expires")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeGrants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    {t("noAccessGrantsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                activeGrants.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{grant.user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {grant.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {grant.room.name}
                    </TableCell>
                    <TableCell>{grant.room.home.name}</TableCell>
                    <TableCell>
                      {getAccessLevelBadge(grant.accessLevel)}
                    </TableCell>
                    <TableCell>{grant.grantor.username}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(grant.grantedAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {grant.expiresAt
                        ? format(new Date(grant.expiresAt), "MMM dd, yyyy")
                        : t("never")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeGrant(grant.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("grantRoomAccess")}</DialogTitle>
            <DialogDescription>{t("grantRoomAccessDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("user")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectUser")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">User 1</SelectItem>
                  <SelectItem value="user2">User 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("room")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectRoom")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room1">{t("livingRoom")}</SelectItem>
                  <SelectItem value="room2">{t("bedroom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("accessLevel")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectAccessLevel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">{t("ownerFullControl")}</SelectItem>
                  <SelectItem value="CONTROL">
                    {t("controlCanControlDevices")}
                  </SelectItem>
                  <SelectItem value="VIEW">{t("viewReadOnly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={() => setShowDialog(false)}>
              {t("grantAccess")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

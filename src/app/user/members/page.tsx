"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Home, Crown, UserCheck, Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import { membersApi, HomeMember } from "@/lib/api/client/members";
import { homesApi, Home as HomeType } from "@/lib/api/client/homes";
import { MembersList } from "./members-list";
import { InviteMemberDialog } from "./invite-member-dialog";

export default function UserMembersPage() {
  const { t } = useLanguage();

  const [members, setMembers] = useState<HomeMember[]>([]);
  const [homes, setHomes] = useState<HomeType[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    loadHomes();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedHomeId) {
      loadMembers();
    }
  }, [selectedHomeId]);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.data) {
        setCurrentUserId(data.data.id);
      }
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const loadHomes = async () => {
    setIsLoading(true);
    try {
      const homesData = await homesApi.list();
      setHomes(homesData);
      if (homesData.length > 0) {
        setSelectedHomeId(homesData[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to load homes:", error);
      toast.error(t("failedToLoadHomes"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!selectedHomeId) return;

    setIsLoading(true);
    try {
      const membersData = await membersApi.listByHome(parseInt(selectedHomeId));
      setMembers(membersData);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast.error(t("failedToLoadMembers"));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedHome = homes.find(
    (h) => h.id === parseInt(selectedHomeId || "0"),
  );
  const isOwner = selectedHome?.ownerUserId === currentUserId;

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "ACTIVE").length,
    invited: members.filter((m) => m.status === "INVITED").length,
    owners: members.filter((m) => m.roleInHome === "OWNER").length,
  };

  if (isLoading && homes.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (homes.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">{t("members")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manageHomeMembersAndInvites")}
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("noHomesYet")}</h3>
            <p className="text-muted-foreground">
              {t("createHomeToManageMembers")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("members")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manageHomeMembersAndInvites")}
          </p>
        </div>
        {isOwner && selectedHomeId && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("inviteMember")}
          </Button>
        )}
      </div>

      {/* Home Selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t("selectHome")}</CardTitle>
          <CardDescription>{t("chooseHomeToManageMembers")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {homes.map((home) => (
                <SelectItem key={home.id} value={home.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {home.name}
                    {home.ownerUserId === currentUserId && (
                      <Badge variant="outline" className="ml-2">
                        <Crown className="h-3 w-3 mr-1" />
                        {t("owner")}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("totalMembers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {t("active")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("invited")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.invited}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {t("owners")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.owners}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("membersList")}</CardTitle>
          <CardDescription>
            {isOwner
              ? t("manageAccessAndPermissions")
              : t("viewHomeMembersAndRoles")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <MembersList
              members={members}
              homeId={parseInt(selectedHomeId)}
              currentUserId={currentUserId}
              onUpdate={loadMembers}
            />
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      {selectedHomeId && (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          homeId={parseInt(selectedHomeId)}
          onSuccess={loadMembers}
        />
      )}
    </div>
  );
}

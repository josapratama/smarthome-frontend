"use client";

import { useState } from "react";
import { HomeMember, membersApi } from "@/lib/api/client/members";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Mail, UserCheck, UserX, Crown } from "lucide-react";
import { toast } from "sonner";

interface MembersListProps {
  members: HomeMember[];
  homeId: number;
  currentUserId: number;
  onUpdate: () => void;
}

export function MembersList({
  members,
  homeId,
  currentUserId,
  onUpdate,
}: MembersListProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HomeMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      await membersApi.remove(homeId, selectedMember.userId);
      toast.success("Member removed successfully");
      setRemoveDialogOpen(false);
      setSelectedMember(null);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvite = async (member: HomeMember) => {
    try {
      await membersApi.resendInvite(homeId, member.userId);
      toast.success("Invitation resent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend invitation");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return (
          <Badge className="bg-yellow-600">
            <Crown className="h-3 w-3 mr-1" />
            Owner
          </Badge>
        );
      case "MEMBER":
        return <Badge className="bg-blue-600">Member</Badge>;
      case "GUEST":
        return <Badge variant="secondary">Guest</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <UserCheck className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "INVITED":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-600"
          >
            <Mail className="h-3 w-3 mr-1" />
            Invited
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No members yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const isOwner = member.roleInHome === "OWNER";

          return (
            <Card key={member.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {member.user?.email || `User #${member.userId}`}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(member.roleInHome)}
                      {getStatusBadge(member.status)}
                    </div>
                    {member.status === "INVITED" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Invited{" "}
                        {new Date(member.invitedAt).toLocaleDateString()}
                      </p>
                    )}
                    {member.joinedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {!isOwner && !isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.status === "INVITED" && (
                          <DropdownMenuItem
                            onClick={() => handleResendInvite(member)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedMember(member);
                            setRemoveDialogOpen(true);
                          }}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.user?.email} from
              this home? They will lose access to all devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isLoading}>
              {isLoading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

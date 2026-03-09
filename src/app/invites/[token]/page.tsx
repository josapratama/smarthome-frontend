"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Home,
  Users,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

interface InviteDetails {
  homeId: number;
  homeName: string;
  inviterName: string;
  inviterEmail: string;
  roleInHome: "MEMBER" | "GUEST";
  invitedAt: string;
  expiresAt: string;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const response = await apiFetchBrowser<{ data: InviteDetails }>(
          `/api/v1/invites/${token}/details`,
        );
        setInviteDetails(response.data);
      } catch (err: any) {
        setError(err?.message || "Invalid or expired invitation");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInviteDetails();
    }
  }, [token]);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetchBrowser(`/api/v1/invites/${token}`, {
        method: "GET",
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully!");
      router.push("/user/dashboard");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to accept invitation");
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetchBrowser(
        `/api/v1/invites/${token}/decline`,
        {
          method: "POST",
        },
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Invitation declined");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to decline invitation");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription>
              {error || "This invitation link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(inviteDetails.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Home Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a smart home
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">{inviteDetails.homeName}</div>
                <div className="text-sm text-muted-foreground">Smart Home</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-semibold">{inviteDetails.inviterName}</div>
                <div className="text-sm text-muted-foreground">
                  {inviteDetails.inviterEmail}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-semibold">Role</div>
                <Badge variant="outline" className="mt-1">
                  {inviteDetails.roleInHome.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>

          {isExpired ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Invitation Expired</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This invitation has expired. Please contact the home owner for a
                new invitation.
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/")}
              >
                Go to Home
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => declineMutation.mutate()}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {declineMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Decline
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            Invited on {new Date(inviteDetails.invitedAt).toLocaleDateString()}
            {!isExpired && (
              <>
                <br />
                Expires on{" "}
                {new Date(inviteDetails.expiresAt).toLocaleDateString()}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

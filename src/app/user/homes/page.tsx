"use client";

import { useEffect, useState } from "react";
import { homesApi, Home } from "@/lib/api/client/homes";
import { CreateHomeDialog } from "@/components/user/create-home-dialog";
import { HomeCard } from "@/components/user/home-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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

export default function UserHomesPage() {
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHome, setSelectedHome] = useState<Home | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get user ID from session/auth
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.id) {
          setUserId(data.data.id);
        }
      })
      .catch(console.error);

    loadHomes();
  }, []);

  const loadHomes = async () => {
    setIsLoading(true);
    try {
      const data = await homesApi.list();
      setHomes(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load homes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHome) return;

    try {
      await homesApi.delete(selectedHome.id);
      toast.success("Home deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedHome(null);
      loadHomes();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete home");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your homes and locations
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} disabled={!userId}>
          <Plus className="h-4 w-4 mr-2" />
          Create Home
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[180px] rounded-lg" />
          ))}
        </div>
      ) : (homes?.length ?? 0) === 0 ? (
        <div className="bg-card rounded-lg shadow-md p-8 text-center border border-border">
          <div className="text-6xl mb-4">🏡</div>
          <h2 className="text-xl font-semibold mb-2">No Homes Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first home to organize your devices by location.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} disabled={!userId}>
            <Plus className="h-4 w-4 mr-2" />
            Create Home
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homes?.map((home) => (
            <HomeCard
              key={home.id}
              home={home}
              onDelete={(home) => {
                setSelectedHome(home);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {userId && (
        <CreateHomeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={loadHomes}
          userId={userId}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Home</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedHome?.name}"? This
              action cannot be undone and will remove all associated devices and
              rooms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

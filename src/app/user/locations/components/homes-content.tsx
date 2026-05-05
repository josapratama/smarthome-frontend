"use client";

import { useTranslation } from "@/hooks/use-translation";
import { CreateHomeDialog } from "./create-home-dialog";
import { HomeCard } from "./home-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { Home as HomeIcon, Plus } from "lucide-react";
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
import { useHomes } from "../hooks/use-homes";

export default function HomesContent() {
  const { t } = useTranslation();
  const {
    homes,
    isLoading,
    userId,
    createDialogOpen,
    setCreateDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedHome,
    openDeleteDialog,
    handleDelete,
    loadHomes,
  } = useHomes();

  return (
    <div className="space-y-6">
      <PageHeader
        stats={
          homes.length > 0
            ? [
                {
                  label: t("totalHomes"),
                  value: homes.length,
                  icon: HomeIcon,
                  color: "text-blue-500",
                },
              ]
            : undefined
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[180px] rounded-lg" />
          ))}
        </div>
      ) : homes.length === 0 ? (
        <div className="bg-card rounded-lg shadow-md p-8 text-center border border-border">
          <div className="text-6xl mb-4">🏡</div>
          <h2 className="text-xl font-semibold mb-2">
            {t("noHomesYet") || "No Homes Yet"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("createFirstHomeDescription") ||
              "Create your first home to organize your devices by location."}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} disabled={!userId}>
            <Plus className="h-4 w-4 mr-2" />
            {t("createHome") || "Create Home"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} onDelete={openDeleteDialog} />
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
            <AlertDialogTitle>
              {t("deleteHome") || "Delete Home"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteHomeConfirmation") || "Are you sure you want to delete"}{" "}
              &ldquo;{selectedHome?.name}&rdquo;?{" "}
              {t("deleteHomeWarning") ||
                "This action cannot be undone and will remove all associated devices and rooms."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

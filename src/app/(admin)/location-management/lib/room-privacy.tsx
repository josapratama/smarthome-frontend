import { Lock, UserCheck, ShieldAlert, Users } from "lucide-react";

export function getPrivacyIcon(privacy: string) {
  switch (privacy) {
    case "PRIVATE":
      return <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />;
    case "SHARED":
      return <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case "RESTRICTED":
      return (
        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      );
    default:
      return <Users className="h-4 w-4 text-green-600 dark:text-green-400" />;
  }
}

export function getPrivacyColor(privacy: string): string {
  switch (privacy) {
    case "PRIVATE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "SHARED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "RESTRICTED":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
}

"use client";

import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toast]:bg-green-50 group-[.toast]:text-green-900 group-[.toast]:border-green-200 dark:group-[.toast]:bg-green-900 dark:group-[.toast]:text-green-50 dark:group-[.toast]:border-green-800",
          error:
            "group-[.toast]:bg-red-50 group-[.toast]:text-red-900 group-[.toast]:border-red-200 dark:group-[.toast]:bg-red-900 dark:group-[.toast]:text-red-50 dark:group-[.toast]:border-red-800",
          warning:
            "group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-900 group-[.toast]:border-yellow-200 dark:group-[.toast]:bg-yellow-900 dark:group-[.toast]:text-yellow-50 dark:group-[.toast]:border-yellow-800",
          info: "group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 group-[.toast]:border-blue-200 dark:group-[.toast]:bg-blue-900 dark:group-[.toast]:text-blue-50 dark:group-[.toast]:border-blue-800",
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-5" />,
        info: <Info className="size-5" />,
        warning: <AlertTriangle className="size-5" />,
        error: <XCircle className="size-5" />,
        loading: <Loader2 className="size-5 animate-spin" />,
      }}
      {...props}
    />
  );
};

export { Toaster };

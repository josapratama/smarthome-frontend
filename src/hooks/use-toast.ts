/**
 * Toast hook using Sonner
 * Wrapper to maintain compatibility with existing code
 */

import { toast as sonnerToast } from "sonner";

export function useToast() {
  const toast = ({
    title,
    description,
    variant = "default",
  }: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive" | "success" | "warning";
  }) => {
    const message = title || "";
    const desc = description;

    switch (variant) {
      case "success":
        return sonnerToast.success(message, { description: desc });
      case "destructive":
        return sonnerToast.error(message, { description: desc });
      case "warning":
        return sonnerToast.warning(message, { description: desc });
      default:
        return sonnerToast.info(message, { description: desc });
    }
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  };

  return {
    toast,
    dismiss,
    // Expose sonner methods directly for advanced usage
    success: sonnerToast.success,
    error: sonnerToast.error,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
    loading: sonnerToast.loading,
    promise: sonnerToast.promise,
  };
}

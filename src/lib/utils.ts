import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const rec = payload as Record<string, unknown>;
  if (typeof rec.message === "string") return rec.message;

  // kadang error dibungkus { error: { message: string } }
  if (rec.error && typeof rec.error === "object") {
    const errRec = rec.error as Record<string, unknown>;
    if (typeof errRec.message === "string") return errRec.message;
  }

  return null;
}

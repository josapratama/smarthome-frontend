export function getRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getLastSeenStatus(lastSeenAt: string | null | undefined) {
  if (!lastSeenAt)
    return { status: "never", color: "bg-gray-500", label: "Never Connected" };
  const diffMins = (Date.now() - new Date(lastSeenAt).getTime()) / 60_000;
  if (diffMins < 5)
    return { status: "online", color: "bg-green-500", label: "Online" };
  if (diffMins < 30)
    return {
      status: "recent",
      color: "bg-yellow-500",
      label: "Recently Active",
    };
  return { status: "offline", color: "bg-red-500", label: "Offline" };
}

export function isCriticalDevice(device: {
  status: boolean;
  lastSeenAt: string | null;
}): boolean {
  if (!device.lastSeenAt) return false;
  const diffHours =
    (Date.now() - new Date(device.lastSeenAt).getTime()) / 3_600_000;
  return !device.status && diffHours > 1;
}

export function fmtDateTime(v?: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actions?: ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: LucideIcon;
    color?: string;
  }>;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  stats,
  className,
}: PageHeaderProps) {
  // If no title, just show stats and actions
  if (!title) {
    return (
      <div className={cn("space-y-4", className)}>
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    {StatIcon && (
                      <StatIcon
                        className={cn(
                          "h-4 w-4",
                          stat.color || "text-muted-foreground",
                        )}
                      />
                    )}
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              );
            })}
          </div>
        )}
        {actions && <div className="flex justify-end">{actions}</div>}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Title and Description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          {Icon && (
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            </div>
          )}
          {!Icon && title && (
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          )}
          {description && (
            <p className="text-sm md:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  {StatIcon && (
                    <StatIcon
                      className={cn(
                        "h-4 w-4",
                        stat.color || "text-muted-foreground",
                      )}
                    />
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

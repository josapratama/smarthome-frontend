"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import { toast } from "sonner";

interface AppInfoData {
  general?: Array<{ key: string; value: string; displayOrder: number }>;
  about?: Array<{ key: string; value: string; displayOrder: number }>;
  contact?: Array<{ key: string; value: string; displayOrder: number }>;
  legal?: Array<{ key: string; value: string; displayOrder: number }>;
}

export default function UserAppInfoPage() {
  const [appInfo, setAppInfo] = useState<AppInfoData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppInfo();
  }, []);

  const loadAppInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/app-info");
      const data = await res.json();
      if (res.ok) {
        setAppInfo(data.data);
      }
    } catch (error) {
      toast.error("Failed to load app info");
    } finally {
      setIsLoading(false);
    }
  };

  const formatKey = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const categoryTitles: Record<string, string> = {
    general: "General Information",
    about: "About",
    contact: "Contact Information",
    legal: "Legal",
  };

  const categoryDescriptions: Record<string, string> = {
    general: "Basic application information",
    about: "Learn more about this application",
    contact: "Get in touch with us",
    legal: "Terms and policies",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">App Information</h1>
        <p className="text-muted-foreground mt-1">
          Learn more about this application
        </p>
      </div>

      {Object.entries(appInfo).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {categoryTitles[category] || category}
            </CardTitle>
            <CardDescription>
              {categoryDescriptions[category] || ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items?.map(
                (info: {
                  key: string;
                  value: string;
                  displayOrder: number;
                }) => (
                  <div key={info.key} className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {formatKey(info.key)}
                    </h4>
                    <p className="text-base whitespace-pre-wrap">
                      {info.value}
                    </p>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(appInfo).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Information Available
            </h3>
            <p className="text-muted-foreground">
              App information will be displayed here when available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Send, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface NotificationTemplate {
  id: number;
  type: string;
  channel: string;
  emailSubject?: string;
  emailBody?: string;
  pushTitle?: string;
  pushBody?: string;
  pushIcon?: string;
  pushSound?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);

  // Send notification form
  const [sendForm, setSendForm] = useState({
    channel: "FCM",
    type: "CUSTOM",
    homeId: "",
    title: "",
    body: "",
    subject: "",
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/notifications/templates");
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.data.templates);
      }
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      const res = await fetch("/api/v1/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: sendForm.channel,
          type: sendForm.type,
          homeId: sendForm.homeId ? parseInt(sendForm.homeId) : undefined,
          customData: {
            title: sendForm.title,
            body: sendForm.body,
            subject: sendForm.subject,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Notification sent to ${data.data.sent} users`);
        setIsSendDialogOpen(false);
        setSendForm({
          channel: "FCM",
          type: "CUSTOM",
          homeId: "",
          title: "",
          body: "",
          subject: "",
        });
      } else {
        toast.error(data.error || "Failed to send notification");
      }
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const handleDeleteTemplate = async (type: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`/api/v1/notifications/templates/${type}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Template deleted");
        loadTemplates();
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === "EMAIL" ? (
      <Mail className="h-4 w-4" />
    ) : (
      <Bell className="h-4 w-4" />
    );
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Manage notification templates and send notifications
          </p>
        </div>
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Send a custom notification to users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select
                    value={sendForm.channel}
                    onValueChange={(val) =>
                      setSendForm({ ...sendForm, channel: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCM">Push Notification</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={sendForm.type}
                    onValueChange={(val) =>
                      setSendForm({ ...sendForm, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                      <SelectItem value="ALARM_FIRE">Fire Alarm</SelectItem>
                      <SelectItem value="ALARM_GAS_LEAK">Gas Leak</SelectItem>
                      <SelectItem value="ALARM_TRASH_FULL">
                        Trash Full
                      </SelectItem>
                      <SelectItem value="ALARM_ANOMALY">Anomaly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Home ID (optional - leave empty to send to all)</Label>
                <Input
                  type="number"
                  placeholder="Enter home ID"
                  value={sendForm.homeId}
                  onChange={(e) =>
                    setSendForm({ ...sendForm, homeId: e.target.value })
                  }
                />
              </div>

              {sendForm.channel === "FCM" ? (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Notification title"
                      value={sendForm.title}
                      onChange={(e) =>
                        setSendForm({ ...sendForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      placeholder="Notification body"
                      value={sendForm.body}
                      onChange={(e) =>
                        setSendForm({ ...sendForm, body: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      placeholder="Email subject"
                      value={sendForm.subject}
                      onChange={(e) =>
                        setSendForm({ ...sendForm, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body (HTML)</Label>
                    <Textarea
                      placeholder="Email body (HTML supported)"
                      value={sendForm.body}
                      onChange={(e) =>
                        setSendForm({ ...sendForm, body: e.target.value })
                      }
                      rows={6}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSendDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendNotification}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getChannelIcon(template.channel)}
                  <CardTitle className="text-lg">
                    {getTypeLabel(template.type)}
                  </CardTitle>
                </div>
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>Channel: {template.channel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {template.channel === "EMAIL" && (
                  <>
                    <div>
                      <span className="font-medium">Subject:</span>{" "}
                      {template.emailSubject}
                    </div>
                    <div>
                      <span className="font-medium">Body:</span>{" "}
                      <span className="text-muted-foreground line-clamp-2">
                        {template.emailBody?.replace(/<[^>]*>/g, "")}
                      </span>
                    </div>
                  </>
                )}
                {template.channel === "FCM" && (
                  <>
                    <div>
                      <span className="font-medium">Title:</span>{" "}
                      {template.pushTitle}
                    </div>
                    <div>
                      <span className="font-medium">Body:</span>{" "}
                      {template.pushBody}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsTemplateDialogOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.type)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first notification template
            </p>
            <Button onClick={() => setIsTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

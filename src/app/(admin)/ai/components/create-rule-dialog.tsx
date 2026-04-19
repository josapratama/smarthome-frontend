import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useTranslation } from "@/hooks/use-translation";
import type { CreateRuleFormData } from "../types";

interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateRuleFormData;
  onFormDataChange: (data: CreateRuleFormData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CreateRuleDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
}: CreateRuleDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("createAiRule")}</DialogTitle>
          <DialogDescription>{t("createAiRuleDescription")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("ruleName")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
              placeholder={t("ruleNamePlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder={t("ruleDescriptionPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">{t("ruleType")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  onFormDataChange({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automation">{t("automation")}</SelectItem>
                  <SelectItem value="alert">{t("alert")}</SelectItem>
                  <SelectItem value="optimization">
                    {t("optimization")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">{t("priority")}</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    priority: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t("trigger")}</Label>
            <Select
              value={formData.conditions.trigger}
              onValueChange={(value: any) =>
                onFormDataChange({
                  ...formData,
                  conditions: { ...formData.conditions, trigger: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sensor_value">{t("sensorValue")}</SelectItem>
                <SelectItem value="time_schedule">
                  {t("timeSchedule")}
                </SelectItem>
                <SelectItem value="device_state">{t("deviceState")}</SelectItem>
                <SelectItem value="energy_threshold">
                  {t("energyThreshold")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t("operator")}</Label>
              <Select
                value={formData.conditions.operator}
                onValueChange={(value: any) =>
                  onFormDataChange({
                    ...formData,
                    conditions: { ...formData.conditions, operator: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gt">&gt; {t("greaterThan")}</SelectItem>
                  <SelectItem value="lt">&lt; {t("lessThan")}</SelectItem>
                  <SelectItem value="eq">= {t("equals")}</SelectItem>
                  <SelectItem value="gte">
                    &gt;= {t("greaterOrEqual")}
                  </SelectItem>
                  <SelectItem value="lte">&lt;= {t("lessOrEqual")}</SelectItem>
                  <SelectItem value="ne">!= {t("notEquals")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("value")}</Label>
              <Input
                type="number"
                value={
                  typeof formData.conditions.value === "number"
                    ? formData.conditions.value
                    : 0
                }
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      value: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t("action")}</Label>
            <Select
              value={formData.actions.actionType}
              onValueChange={(value: any) =>
                onFormDataChange({
                  ...formData,
                  actions: { ...formData.actions, actionType: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="control_device">
                  {t("controlDevice")}
                </SelectItem>
                <SelectItem value="send_notification">
                  {t("sendNotification")}
                </SelectItem>
                <SelectItem value="create_alarm">{t("createAlarm")}</SelectItem>
                <SelectItem value="log_event">{t("logEvent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

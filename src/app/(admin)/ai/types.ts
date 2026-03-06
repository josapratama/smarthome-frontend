export type AITab = "predictions" | "anomalies" | "rules" | "models";

export interface CreateRuleFormData {
  name: string;
  description: string;
  type: "automation" | "alert" | "optimization";
  conditions: {
    trigger:
      | "sensor_value"
      | "time_schedule"
      | "device_state"
      | "energy_threshold";
    operator: "gt" | "lt" | "eq" | "gte" | "lte" | "ne";
    value: number;
  };
  actions: {
    actionType:
      | "control_device"
      | "send_notification"
      | "create_alarm"
      | "log_event";
    command: string;
  };
  priority: number;
}

import { apiFetchBrowser } from "../client/fetch";

export type CommandStatus = "PENDING" | "SENT" | "ACKED" | "FAILED" | "TIMEOUT";
export type CommandSource = "USER" | "BACKEND" | "AI" | "ADMIN";

export interface Command {
  id: number;
  deviceId: number;
  type: string;
  payload: any;
  status: CommandStatus;
  ackedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  requestedBy?: number;
  source: CommandSource;
  correlationId: string;
}

export interface SendCommandInput {
  type: string;
  payload: any;
}

export const commandsApi = {
  list: async (
    deviceId: number,
    options?: { limit?: number; status?: CommandStatus },
  ): Promise<Command[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.status) params.append("status", options.status);
    const res = await apiFetchBrowser<{ data: { commands: Command[] } }>(
      `/api/v1/devices/${deviceId}/commands?${params.toString()}`,
    );
    return res.data.commands;
  },

  get: async (deviceId: number, commandId: number): Promise<Command> => {
    const res = await apiFetchBrowser<{ data: { command: Command } }>(
      `/api/v1/devices/${deviceId}/commands/${commandId}`,
    );
    return res.data.command;
  },

  send: async (deviceId: number, input: SendCommandInput): Promise<Command> => {
    const res = await apiFetchBrowser<{ data: { command: Command } }>(
      `/api/v1/devices/${deviceId}/commands`,
      { method: "POST", body: JSON.stringify(input) },
    );
    return res.data.command;
  },

  retry: async (deviceId: number, commandId: number): Promise<Command> => {
    const res = await apiFetchBrowser<{ data: { command: Command } }>(
      `/api/v1/devices/${deviceId}/commands/${commandId}/retry`,
      { method: "POST" },
    );
    return res.data.command;
  },

  cancel: async (deviceId: number, commandId: number): Promise<void> => {
    await apiFetchBrowser(`/api/v1/devices/${deviceId}/commands/${commandId}`, {
      method: "DELETE",
    });
  },

  turnOn: (deviceId: number) =>
    commandsApi.send(deviceId, { type: "SET_STATE", payload: { state: true } }),
  turnOff: (deviceId: number) =>
    commandsApi.send(deviceId, {
      type: "SET_STATE",
      payload: { state: false },
    }),
  setValue: (deviceId: number, value: number) =>
    commandsApi.send(deviceId, { type: "SET_VALUE", payload: { value } }),
  reboot: (deviceId: number) =>
    commandsApi.send(deviceId, { type: "REBOOT", payload: {} }),
};

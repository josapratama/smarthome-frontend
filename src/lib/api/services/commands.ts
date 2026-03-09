import { api } from "../client/axios";

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
  // Get command history for a device
  list: async (
    deviceId: number,
    options?: {
      limit?: number;
      status?: CommandStatus;
    },
  ): Promise<Command[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.status) params.append("status", options.status);

    const { data } = await api.get<{ data: { commands: Command[] } }>(
      `/v1/devices/${deviceId}/commands?${params.toString()}`,
    );
    return data.data.commands;
  },

  // Get single command
  get: async (deviceId: number, commandId: number): Promise<Command> => {
    const { data } = await api.get<{ data: { command: Command } }>(
      `/v1/devices/${deviceId}/commands/${commandId}`,
    );
    return data.data.command;
  },

  // Send command to device
  send: async (deviceId: number, input: SendCommandInput): Promise<Command> => {
    const { data } = await api.post<{ data: { command: Command } }>(
      `/v1/devices/${deviceId}/commands`,
      input,
    );
    return data.data.command;
  },

  // Retry failed command
  retry: async (deviceId: number, commandId: number): Promise<Command> => {
    const { data } = await api.post<{ data: { command: Command } }>(
      `/v1/devices/${deviceId}/commands/${commandId}/retry`,
    );
    return data.data.command;
  },

  // Cancel pending command
  cancel: async (deviceId: number, commandId: number): Promise<void> => {
    await api.delete(`/v1/devices/${deviceId}/commands/${commandId}`);
  },

  // Common command shortcuts
  turnOn: async (deviceId: number): Promise<Command> => {
    return commandsApi.send(deviceId, {
      type: "SET_STATE",
      payload: { state: true },
    });
  },

  turnOff: async (deviceId: number): Promise<Command> => {
    return commandsApi.send(deviceId, {
      type: "SET_STATE",
      payload: { state: false },
    });
  },

  setValue: async (deviceId: number, value: number): Promise<Command> => {
    return commandsApi.send(deviceId, {
      type: "SET_VALUE",
      payload: { value },
    });
  },

  reboot: async (deviceId: number): Promise<Command> => {
    return commandsApi.send(deviceId, {
      type: "REBOOT",
      payload: {},
    });
  },
};

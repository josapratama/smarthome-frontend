import type { ChannelType } from "@/lib/api/dto/channel.dto";

export const CHANNEL_TYPES: ChannelType[] = [
  "RELAY",
  "SENSOR",
  "DIMMER",
  "SERVO",
  "RGB_LED",
  "ANALOG_IN",
  "DIGITAL_IN",
];

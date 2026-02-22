import type { paths } from "@/generated/api";

export type ApiPaths = paths;

export type Json200<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends {
  responses: { 200: { content: { "application/json": infer R } } };
}
  ? R
  : never;

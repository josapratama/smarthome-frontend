# API Layer Structure

Struktur folder API telah direorganisasi mengikuti best practices untuk memisahkan concerns dan meningkatkan maintainability.

## Struktur Folder

```
src/lib/api/
├── client/              # HTTP Clients (Infrastructure Layer)
│   ├── axios.ts        # Axios-based HTTP client dengan interceptors
│   ├── fetch.ts        # Fetch-based HTTP client untuk browser
│   └── index.ts        # Barrel export untuk clients
│
├── server/             # Server-side Utilities
│   ├── auth-cookies.ts # Cookie management untuk authentication
│   ├── auth-upstream.ts # Upstream auth API calls
│   ├── backend.ts      # Backend API calls dengan auth
│   ├── upstream.ts     # Upstream API calls tanpa auth
│   └── error-handler.ts # Error handling utilities
│
├── services/           # API Services (Business Logic Layer)
│   ├── auth.ts         # Authentication services
│   ├── devices.ts      # Device management services
│   ├── homes.ts        # Home management services
│   ├── rooms.ts        # Room management services
│   ├── members.ts      # Member management services
│   ├── alarms.ts       # Alarm services
│   ├── energy.ts       # Energy monitoring services
│   ├── telemetry.ts    # Telemetry data services
│   ├── chat.ts         # Chat services
│   ├── messaging.ts    # Messaging services
│   ├── ai.ts           # AI services
│   ├── ai-models.ts    # AI model management
│   ├── ai-training.ts  # AI training services
│   ├── channels.ts     # Channel management
│   ├── commands.ts     # Device command services
│   ├── device-config.ts # Device configuration
│   ├── energy-cost.ts  # Energy cost calculation
│   ├── faq.ts          # FAQ services
│   ├── home-ai-models.ts # Home-specific AI models
│   ├── ota.ts          # OTA update services
│   ├── preferences.ts  # User preferences
│   ├── privacy.ts      # Privacy settings
│   ├── room-access.ts  # Room access control
│   └── index.ts        # Barrel export untuk services
│
├── dto/                # Data Transfer Objects
│   ├── auth.dto.ts
│   ├── devices.dto.ts
│   ├── homes.dto.ts
│   └── ... (semua DTOs)
│
├── errors.ts           # Error types dan utilities
├── openapi-types.ts    # OpenAPI type definitions
├── queries.ts          # React Query keys dan utilities
└── README.md           # Dokumentasi ini
```

## Prinsip Arsitektur

### 1. Separation of Concerns

- **Client Layer**: Hanya menangani HTTP communication
- **Service Layer**: Business logic dan API calls
- **DTO Layer**: Type definitions dan data structures
- **Server Layer**: Server-side specific utilities

### 2. Client Layer

#### axios.ts

- Axios-based client dengan interceptors
- Auto token refresh
- Request/response interceptors
- Digunakan untuk: Admin pages, complex API calls

```typescript
import { api, apiClient } from "@/lib/api/client/axios";

// Set token
apiClient.setAccessToken(token);

// Make API call
const response = await api.get("/v1/devices");
```

#### fetch.ts

- Fetch-based client untuk browser
- Cookie-based authentication
- Query params support
- Digunakan untuk: User pages, simple API calls

```typescript
import { apiFetchBrowser, browserApi } from "@/lib/api/client/fetch";

// Simple GET
const data = await browserApi.get("/api/v1/homes");

// POST with body
const result = await browserApi.post("/api/v1/devices", { name: "Device 1" });

// With custom options
const data = await apiFetchBrowser("/api/v1/devices", {
  method: "GET",
  params: { homeId: 1 },
});
```

### 3. Service Layer

Semua business logic dan API calls ada di services folder. Setiap service file mengexport functions dan types yang related.

```typescript
// Import dari services
import { devicesApi } from "@/lib/api/services/devices";
import { homesApi } from "@/lib/api/services/homes";

// Atau import semua dari barrel
import { devicesApi, homesApi } from "@/lib/api/services";

// Usage
const devices = await devicesApi.list(homeId);
const home = await homesApi.getById(homeId);
```

### 4. Server Layer

Server-side utilities untuk Next.js API routes.

```typescript
// In API route
import { backendFetch } from "@/lib/api/server/backend";
import { upstreamFetch } from "@/lib/api/server/upstream";
import {
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/api/server/auth-cookies";

// Authenticated call
const data = await backendFetch("/api/v1/devices");

// Public call
const data = await upstreamFetch("/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email }),
});

// Set cookies
await setAuthCookies(accessToken, refreshToken);
```

## Migration Guide

### Dari Old Structure ke New Structure

```typescript
// OLD
import { api } from "@/lib/api/client";
import { devicesApi } from "@/lib/api/client/devices";
import { getHomes } from "@/lib/api/homes";
import { apiFetchBrowser } from "@/lib/api/client.browser";

// NEW
import { api } from "@/lib/api/client/axios";
import { devicesApi } from "@/lib/api/services/devices";
import { homesApi } from "@/lib/api/services/homes";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
```

## Best Practices

1. **Import dari services, bukan langsung dari client**

   ```typescript
   // ✅ Good
   import { devicesApi } from "@/lib/api/services/devices";

   // ❌ Bad
   import { api } from "@/lib/api/client/axios";
   api.get("/v1/devices"); // Langsung call API
   ```

2. **Gunakan barrel exports**

   ```typescript
   // ✅ Good
   import { devicesApi, homesApi, roomsApi } from "@/lib/api/services";

   // ❌ Bad
   import { devicesApi } from "@/lib/api/services/devices";
   import { homesApi } from "@/lib/api/services/homes";
   import { roomsApi } from "@/lib/api/services/rooms";
   ```

3. **Pilih client yang tepat**
   - Gunakan `axios.ts` untuk: Admin pages, complex interceptors
   - Gunakan `fetch.ts` untuk: User pages, simple calls, SSR

4. **Type safety**
   - Selalu gunakan DTOs dari `dto/` folder
   - Export types dari service files
   - Gunakan generics untuk type inference

## Changelog

### v2.0.0 (2026-03-09)

- ✅ Reorganisasi struktur folder
- ✅ Pisahkan client dan services layer
- ✅ Rename `client.ts` → `client/axios.ts`
- ✅ Rename `client.browser.ts` → `client/fetch.ts`
- ✅ Move semua API services ke `services/` folder
- ✅ Hapus file redundant (`homes.ts`, `devices.ts` di root)
- ✅ Update semua imports di codebase
- ✅ Tambah barrel exports (`index.ts`)
- ✅ Centralized config untuk environment variables

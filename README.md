# Smart Home Frontend - User Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

Aplikasi web untuk pengguna Smart Home IoT - Monitor dan kontrol perangkat IoT Anda dari mana saja.

## 🏠 Tentang Aplikasi

Smart Home Frontend adalah aplikasi web untuk **pengguna akhir** (bukan admin) yang memungkinkan mereka untuk:

- 📱 Monitor perangkat IoT secara real-time
- 🎛️ Kontrol perangkat (on/off, pengaturan)
- 📊 Lihat konsumsi energi dan statistik
- 🚨 Terima notifikasi alarm
- 🏡 Kelola rumah dan ruangan
- 👥 Undang anggota keluarga
- 📈 Lihat riwayat dan analitik

## 🔐 Perbedaan dengan Admin Dashboard

| Fitur                 | User Frontend                           | Admin Dashboard                |
| --------------------- | --------------------------------------- | ------------------------------ |
| **Target User**       | Pemilik rumah & anggota keluarga        | Administrator sistem           |
| **Authentication**    | USER role only                          | ADMIN role only                |
| **Device Management** | Monitor & control devices milik sendiri | Manage semua devices di sistem |
| **Home Management**   | Manage rumah sendiri                    | View semua homes               |
| **User Management**   | Invite anggota ke rumah sendiri         | Manage semua users             |
| **Analytics**         | Lihat data rumah sendiri                | Lihat data seluruh sistem      |
| **Firmware/OTA**      | ❌ Tidak ada akses                      | ✅ Full access                 |
| **System Settings**   | ❌ Tidak ada akses                      | ✅ Full access                 |
| **UI/UX**             | User-friendly, mobile-first             | Data-heavy, desktop-first      |

## 🚀 Fitur Utama

### 📱 Dashboard Pengguna

- **Overview Rumah**: Status semua perangkat dalam satu tampilan
- **Quick Controls**: Kontrol cepat perangkat favorit
- **Energy Monitor**: Konsumsi energi real-time
- **Alarm Notifications**: Notifikasi alarm penting
- **Weather Integration**: Cuaca lokal (opsional)

### 🎛️ Device Control

- **Real-time Status**: Status perangkat update otomatis
- **Remote Control**: Kontrol perangkat dari mana saja
- **Device Grouping**: Kelompokkan perangkat per ruangan
- **Scheduling**: Jadwalkan on/off perangkat (future)
- **Scenes**: Buat scene untuk multiple devices (future)

### 📊 Energy Monitoring

- **Real-time Consumption**: Konsumsi energi saat ini
- **Historical Data**: Grafik konsumsi harian/mingguan/bulanan
- **Cost Estimation**: Estimasi biaya listrik
- **AI Predictions**: Prediksi konsumsi energi
- **Savings Tips**: Tips hemat energi dari AI

### 🚨 Alarm & Notifications

- **Real-time Alerts**: Notifikasi instant untuk alarm
- **Alarm History**: Riwayat semua alarm
- **Severity Levels**: Prioritas alarm (Low, Medium, High, Critical)
- **Acknowledge/Resolve**: Tandai alarm sudah ditangani
- **Push Notifications**: Notifikasi push ke mobile (future)

### 🏡 Home Management

- **Multiple Homes**: Kelola beberapa rumah
- **Room Organization**: Atur perangkat per ruangan
- **Home Members**: Undang anggota keluarga
- **Role Management**: Owner, Member, Guest roles
- **Home Settings**: Pengaturan rumah

### 👥 Family Sharing

- **Invite Members**: Undang anggota via email/link
- **Role-based Access**: Kontrol akses per anggota
- **Activity Log**: Lihat aktivitas anggota
- **Member Management**: Kelola anggota rumah

### 📈 Analytics & Reports

- **Energy Reports**: Laporan konsumsi energi
- **Device Usage**: Pola penggunaan perangkat
- **Cost Analysis**: Analisis biaya listrik
- **Comparison**: Bandingkan periode waktu
- **Export Data**: Export ke PDF/CSV

### ⚙️ Settings & Profile

- **Profile Management**: Edit profil pengguna
- **Notification Settings**: Atur preferensi notifikasi
- **Theme Settings**: Light/Dark mode
- **Language**: Bahasa Indonesia/English
- **Security**: Change password, 2FA (future)

## 🛠️ Tech Stack

### Frontend Framework

- **Next.js 14** - React framework dengan App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Lucide Icons** - Beautiful icon set
- **Framer Motion** - Animations (opsional)

### State Management

- **Zustand** - Global state management
- **TanStack Query (React Query)** - Server state & caching
- **React Hook Form** - Form state management

### Data Visualization

- **Recharts** - Charts dan graphs
- **React Gauge Chart** - Gauge untuk energy monitoring

### Real-time Communication

- **Socket.io Client** - WebSocket untuk real-time updates
- **MQTT over WebSocket** - Direct MQTT connection (opsional)

### HTTP Client

- **Axios** - HTTP requests dengan interceptors

### Utilities

- **date-fns** - Date manipulation
- **zod** - Schema validation
- **clsx** - Conditional classnames

## 📦 Installation

### Prerequisites

- Node.js 18+ atau Bun
- npm/yarn/pnpm/bun
- Backend API running

### Setup

```bash
# Clone repository
git clone <repository-url>
cd smarthome-frontend

# Install dependencies
npm install
# atau
bun install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=Smart Home
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features (optional)
NEXT_PUBLIC_ENABLE_WEATHER=false
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
```

## 🏃 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

Development server akan berjalan di http://localhost:3001

## 📁 Project Structure

```
smarthome-frontend/
├── public/                     # Static assets
│   ├── images/                # Images
│   ├── icons/                 # Icons & favicons
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (main)/           # Main app pages
│   │   │   ├── dashboard/    # Dashboard
│   │   │   ├── devices/      # Device management
│   │   │   ├── rooms/        # Room management
│   │   │   ├── energy/       # Energy monitoring
│   │   │   ├── alarms/       # Alarm management
│   │   │   ├── homes/        # Home management
│   │   │   ├── members/      # Member management
│   │   │   ├── analytics/    # Analytics & reports
│   │   │   └── settings/     # Settings
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── footer.tsx
│   │   ├── dashboard/       # Dashboard widgets
│   │   │   ├── stats-card.tsx
│   │   │   ├── device-grid.tsx
│   │   │   ├── energy-widget.tsx
│   │   │   └── alarm-widget.tsx
│   │   ├── devices/         # Device components
│   │   │   ├── device-card.tsx
│   │   │   ├── device-control.tsx
│   │   │   ├── device-status.tsx
│   │   │   └── device-telemetry.tsx
│   │   ├── energy/          # Energy components
│   │   │   ├── energy-chart.tsx
│   │   │   ├── cost-card.tsx
│   │   │   └── prediction-card.tsx
│   │   ├── alarms/          # Alarm components
│   │   │   ├── alarm-list.tsx
│   │   │   ├── alarm-card.tsx
│   │   │   └── alarm-badge.tsx
│   │   └── shared/          # Shared components
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       └── empty-state.tsx
│   ├── lib/                 # Utilities & configurations
│   │   ├── api/            # API client & endpoints
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── devices.ts
│   │   │   ├── homes.ts
│   │   │   ├── rooms.ts
│   │   │   ├── alarms.ts
│   │   │   ├── energy.ts
│   │   │   └── members.ts
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-devices.ts
│   │   │   ├── use-homes.ts
│   │   │   ├── use-alarms.ts
│   │   │   ├── use-energy.ts
│   │   │   └── use-websocket.ts
│   │   ├── store/          # Zustand stores
│   │   │   ├── auth.ts
│   │   │   ├── ui.ts
│   │   │   └── settings.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/          # Utility functions
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   └── utils.ts        # Main utils
│   └── styles/             # Additional styles
│       └── custom.css
├── .env.example            # Environment template
├── .env.local              # Local environment (gitignored)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🔐 Authentication & Authorization

### User Authentication Flow

1. **Register/Login**
   - User register dengan email & password
   - Verifikasi email (opsional)
   - Login mendapat access token & refresh token

2. **Token Management**
   - Access token disimpan di memory (tidak di localStorage)
   - Refresh token di httpOnly cookie (handled by backend)
   - Auto refresh saat access token expired

3. **Role Check**
   - Frontend hanya untuk USER role
   - ADMIN role akan di-redirect ke admin dashboard
   - Protected routes check authentication

### Protected Routes

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("refreshToken");
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Mobile-First Approach

```tsx
// Example responsive component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <DeviceCard />
  <DeviceCard />
  <DeviceCard />
</div>
```

### Mobile Navigation

- Bottom navigation bar untuk mobile
- Sidebar untuk tablet/desktop
- Hamburger menu untuk mobile

## 🎨 UI/UX Design

### Color Scheme

```css
/* Light Mode */
--primary: #3b82f6 (Blue) --success: #10b981 (Green) --warning: #f59e0b (Yellow)
  --danger: #ef4444 (Red) --info: #06b6d4 (Cyan) /* Dark Mode */
  --primary: #60a5fa --success: #34d399 --warning: #fbbf24 --danger: #f87171
  --info: #22d3ee;
```

### Typography

- **Headings**: font-bold, text-2xl/3xl/4xl
- **Body**: font-normal, text-base
- **Small**: text-sm
- **Tiny**: text-xs

### Components

- **Cards**: rounded-lg, shadow-sm, border
- **Buttons**: rounded-md, shadow-sm
- **Inputs**: rounded-md, border
- **Badges**: rounded-full, text-xs

## 🔄 Real-time Updates

### WebSocket Connection

```typescript
// lib/hooks/use-websocket.ts
import { useEffect } from "use";
import { io } from "socket.io-client";

export function useWebSocket() {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!);

    socket.on("device:status", (data) => {
      // Update device status
    });

    socket.on("alarm:new", (data) => {
      // Show alarm notification
    });

    socket.on("telemetry:update", (data) => {
      // Update telemetry data
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
```

### Real-time Features

- ✅ Device status updates
- ✅ Telemetry data streaming
- ✅ Alarm notifications
- ✅ Energy consumption updates
- ✅ Member activity updates

## 📊 Data Fetching Strategy

### React Query Configuration

```typescript
// app/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});
```

### Query Keys Convention

```typescript
// Device queries
["devices"][("devices", homeId)][("device", deviceId)][ // All devices // Devices by home // Single device
  ("device", deviceId, "telemetry")
][ // Device telemetry
  // Home queries
  "homes"
][("home", homeId)][("home", homeId, "members")][ // All homes // Single home // Home members
  // Alarm queries
  "alarms"
][("alarms", { status: "OPEN" })][("alarm", alarmId)][ // All alarms // Filtered alarms // Single alarm
  // Energy queries
  ("energy", deviceId)
][("energy", homeId, "daily")][("energy", homeId, "monthly")]; // Device energy // Daily energy // Monthly energy
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001

CMD ["node", "server.js"]
```

```bash
# Build Docker image
docker build -t smarthome-frontend .

# Run container
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000 \
  smarthome-frontend
```

### Environment Variables for Production

```env
# Production API
NEXT_PUBLIC_API_URL=https://api.smarthome.com
NEXT_PUBLIC_WS_URL=wss://api.smarthome.com

# App Configuration
NEXT_PUBLIC_APP_NAME=Smart Home
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_WEATHER=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🔒 Security Best Practices

### 1. Authentication

- ✅ JWT tokens dengan expiry
- ✅ Refresh token rotation
- ✅ httpOnly cookies untuk refresh token
- ✅ CSRF protection

### 2. Authorization

- ✅ Role-based access control
- ✅ Protected routes
- ✅ API request validation

### 3. Data Protection

- ✅ HTTPS only in production
- ✅ Secure headers (CSP, HSTS, etc.)
- ✅ Input sanitization
- ✅ XSS prevention

### 4. API Security

- ✅ Rate limiting
- ✅ Request validation
- ✅ Error handling (no sensitive info leak)

## 📈 Performance Optimization

### 1. Code Splitting

- Automatic code splitting by Next.js
- Dynamic imports untuk heavy components
- Route-based splitting

### 2. Image Optimization

- Next.js Image component
- Lazy loading
- WebP format
- Responsive images

### 3. Caching Strategy

- React Query caching
- Service Worker (PWA)
- Static page generation
- Incremental Static Regeneration

### 4. Bundle Size

- Tree shaking
- Remove unused dependencies
- Analyze bundle dengan `@next/bundle-analyzer`

## 🌐 Internationalization (i18n)

```typescript
// lib/i18n/config.ts
export const locales = ['id', 'en'] as const
export const defaultLocale = 'id' as const

// Usage
import { useTranslation } from 'next-i18next'

function Component() {
  const { t } = useTranslation('common')
  return <h1>{t('welcome')}</h1>
}
```

## 📱 Progressive Web App (PWA)

### Features

- ✅ Offline support
- ✅ Install to home screen
- ✅ Push notifications
- ✅ Background sync

### Configuration

```json
// public/manifest.json
{
  "name": "Smart Home",
  "short_name": "SmartHome",
  "description": "Control your smart home devices",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

**1. CORS Error**

```
Solution: Pastikan backend sudah enable CORS untuk frontend URL
```

**2. 401 Unauthorized**

```
Solution: Token expired atau invalid. Cek refresh token mechanism
```

**3. WebSocket Connection Failed**

```
Solution: Cek WS_URL dan pastikan backend WebSocket server running
```

**4. Build Error**

```bash
# Clear cache dan rebuild
rm -rf .next
npm run build
```

**5. Type Errors**

```bash
# Run type check
npm run type-check
```

## 📞 Support & Documentation

### Resources

- **Backend API**: [Backend Documentation](../smarthome-backend/docs/)
- **Admin Dashboard**: [Admin Documentation](../smarthome-admin/README.md)
- **IoT Devices**: [IoT Documentation](../smarthome-iot/README.md)

### API Endpoints

- **Base URL**: `http://localhost:3000/api/v1`
- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/openapi.json`

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@smarthome.com

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Shadcn/ui** - UI components
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

---

## 📋 Checklist Implementasi

### Phase 1: Setup & Authentication ✅

- [x] Project setup
- [x] Environment configuration
- [x] API client setup
- [ ] Login page
- [ ] Register page
- [ ] Forgot password
- [ ] Protected routes
- [ ] Role check (USER only)

### Phase 2: Dashboard & Devices 🔄

- [ ] Dashboard layout
- [ ] Dashboard overview
- [ ] Device list
- [ ] Device detail
- [ ] Device control
- [ ] Real-time telemetry
- [ ] Device grouping by room

### Phase 3: Energy & Analytics 📊

- [ ] Energy dashboard
- [ ] Energy charts
- [ ] Cost estimation
- [ ] AI predictions
- [ ] Historical data
- [ ] Export reports

### Phase 4: Alarms & Notifications 🚨

- [ ] Alarm list
- [ ] Alarm detail
- [ ] Acknowledge/resolve
- [ ] Real-time notifications
- [ ] Notification settings
- [ ] Push notifications

### Phase 5: Home & Members 🏡

- [ ] Home management
- [ ] Room management
- [ ] Member invitations
- [ ] Role management
- [ ] Activity log
- [ ] Home settings

### Phase 6: Settings & Profile ⚙️

- [ ] Profile page
- [ ] Change password
- [ ] Notification preferences
- [ ] Theme settings
- [ ] Language settings
- [ ] Security settings

### Phase 7: Polish & Deploy 🚀

- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] PWA setup
- [ ] Performance optimization
- [ ] Testing
- [ ] Deployment

---

**Built with ❤️ for Smart Home Users**

Untuk memulai development, lihat [QUICK_START.md](./QUICK_START.md) dan [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md).

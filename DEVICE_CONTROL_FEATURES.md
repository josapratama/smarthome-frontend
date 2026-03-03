# Fitur Kontrol Perangkat - User Frontend

## Overview

Implementasi lengkap halaman detail perangkat dengan kontrol real-time dan monitoring telemetri untuk sistem Smart Home.

## Fitur yang Telah Diimplementasikan

### 1. Halaman Daftar Perangkat (`/user/devices`)

- **Desain Modern**: Card layout dengan hover effects dan transitions
- **Statistik**: Total perangkat, online, dan offline
- **Icon Dinamis**: Icon berbeda untuk setiap tipe perangkat (lampu, kipas, AC, power meter)
- **Status Badge**: Badge berwarna dengan icon untuk status online/offline
- **Informasi Lengkap**: Nama rumah, ruangan, versi firmware, last seen
- **Responsive**: Grid layout yang menyesuaikan dengan ukuran layar
- **Refresh Button**: Tombol untuk memuat ulang data perangkat

### 2. Halaman Detail Perangkat (`/user/devices/[deviceId]`)

- **Informasi Perangkat**: Card dengan detail lengkap (rumah, ruangan, firmware, last seen)
- **Kontrol Perangkat**: Interface kontrol yang berbeda untuk setiap tipe perangkat
- **Live Monitoring**: Monitoring sensor real-time dengan polling 5 detik
- **Riwayat Telemetri**: Tabel dengan 10 data telemetri terbaru
- **Navigation**: Tombol back untuk kembali ke daftar perangkat

### 3. Komponen Kontrol Perangkat (`DeviceControl`)

Mendukung berbagai tipe perangkat:

#### a. Lampu (Light)

- Toggle power on/off
- Slider brightness (0-100%)
- Icon: 💡 (Lightbulb)

#### b. Kipas (Fan)

- Toggle power on/off
- Slider speed (0-100%)
- Icon: 🌀 (Fan)

#### c. AC/Thermostat

- Toggle power on/off
- Slider temperature (16-30°C)
- Icon: 🌡️ (Thermometer)

#### d. Perangkat Lain

- Toggle power on/off saja
- Icon: ⚡ (Power)

### 4. Komponen Sensor Card

- **Mode Normal**: Card besar untuk dashboard dengan informasi lengkap
- **Mode Compact**: Card kecil untuk halaman detail perangkat
- **Status Indicator**: 🟢 Aman, 🟡 Peringatan, 🔴 Bahaya
- **Trend Indicator**: ↗️ Meningkat, ↘️ Menurun, ➖ Stabil
- **Last Update**: Timestamp dengan format relatif (5s ago, 2m ago)
- **Color Coding**: Border dan background sesuai status

### 5. Monitoring Telemetri

Data sensor yang didukung:

- **Voltage** (Tegangan) - V
- **Current** (Arus) - A
- **Power** (Daya) - W
- **Temperature** (Suhu) - °C
- **Humidity** (Kelembaban) - %

### 6. API Routes

- `GET /api/v1/devices` - Daftar semua perangkat
- `GET /api/v1/devices/[deviceId]` - Detail perangkat
- `GET /api/v1/devices/[deviceId]/telemetry` - Data telemetri
- `POST /api/v1/devices/[deviceId]/commands` - Kirim perintah kontrol

## Teknologi yang Digunakan

### UI Components

- **Radix UI**: Slider, Switch, Badge
- **Lucide Icons**: Icon set modern
- **Tailwind CSS**: Styling dengan utility classes
- **Sonner**: Toast notifications

### State Management

- **React Hooks**: useState, useEffect
- **Real-time Polling**: setInterval untuk update telemetri

### Internationalization

- **i18n**: Dukungan Bahasa Indonesia dan English
- **Translation Keys**: Semua text menggunakan `t()` function

## Cara Penggunaan

### 1. Melihat Daftar Perangkat

```
Navigasi: /user/devices
- Lihat semua perangkat yang terdaftar
- Klik card perangkat untuk melihat detail
- Gunakan tombol refresh untuk update data
```

### 2. Mengontrol Perangkat

```
Navigasi: /user/devices/[deviceId]
- Toggle power on/off dengan switch
- Adjust brightness/speed/temperature dengan slider
- Perubahan akan langsung dikirim ke perangkat via MQTT
```

### 3. Monitoring Sensor

```
Navigasi: /user/devices/[deviceId]
- Lihat data sensor real-time di section "Live Monitoring"
- Data diupdate otomatis setiap 5 detik
- Lihat riwayat telemetri di tabel bawah
```

## Status Sensor

### Temperature (Suhu)

- 🟢 **Aman**: < 30°C
- 🟡 **Peringatan**: 30-35°C
- 🔴 **Bahaya**: > 35°C

### Humidity (Kelembaban)

- 🟢 **Aman**: 30-80%
- 🟡 **Peringatan**: < 30% atau > 80%

### Power (Daya)

- 🟢 **Aman**: < 1500W
- 🟡 **Peringatan**: 1500-2000W
- 🔴 **Bahaya**: > 2000W

## Responsive Design

### Mobile (< 768px)

- Single column layout
- Bottom navigation bar dengan 5 menu utama
- Compact cards
- Touch-friendly controls

### Tablet (768px - 1024px)

- 2 column grid untuk devices
- Side navigation
- Medium-sized cards

### Desktop (> 1024px)

- 3 column grid untuk devices
- Full sidebar navigation
- Large cards dengan hover effects

## Next Steps (Belum Diimplementasikan)

1. **Real MQTT Integration**
   - Saat ini menggunakan HTTP POST untuk kirim command
   - Perlu integrasi dengan MQTT broker untuk real-time control

2. **WebSocket untuk Telemetri**
   - Ganti polling dengan WebSocket untuk efisiensi
   - Real-time updates tanpa delay

3. **Scene Control**
   - Kontrol multiple devices sekaligus
   - Preset scenes (Movie Mode, Sleep Mode, etc.)

4. **Automation Rules**
   - If-then rules untuk otomasi
   - Schedule-based automation

5. **Energy Analytics**
   - Grafik penggunaan energi
   - Cost calculation
   - Comparison charts

6. **Device Grouping**
   - Group devices by room
   - Bulk control

7. **Voice Control Integration**
   - Google Assistant
   - Alexa

## File Structure

```
smarthome-frontend/
├── src/
│   ├── app/
│   │   ├── api/v1/devices/
│   │   │   ├── route.ts
│   │   │   └── [deviceId]/
│   │   │       ├── commands/route.ts
│   │   │       └── telemetry/route.ts
│   │   └── user/
│   │       └── devices/
│   │           ├── page.tsx (list)
│   │           └── [deviceId]/
│   │               └── page.tsx (detail)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   └── badge.tsx
│   │   └── user/
│   │       ├── device-control.tsx
│   │       ├── sensor-card.tsx
│   │       ├── UserTopbar.tsx
│   │       ├── UserSidebar.tsx
│   │       └── UserMobileNav.tsx
│   └── lib/
│       ├── api/client/devices.ts
│       └── i18n/locales/
│           ├── id.ts
│           └── en.ts
```

## Commit History

- `feat(user): implement device detail page with control and telemetry`
- `feat(user): redesign user frontend with modern mobile-first UI`
- `i18n: complete translations for all languages`

---

**Dibuat**: 3 Maret 2026
**Status**: ✅ Completed
**Developer**: AI Assistant (Kiro)

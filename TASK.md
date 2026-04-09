# TrackRide Frontend Task Breakdown

Dokumen ini adalah breakdown implementasi frontend berdasarkan `CLAUDE.md`.
Format dibuat sebagai checklist kerja agar bisa dipakai untuk planning, issue breakdown, dan tracking progres implementasi.

## General Acceptance Notes

- [ ] Error handling dasar untuk auth, GPS, WebSocket, dan share tersedia
- [ ] Naming, endpoint, dan shape data mengikuti kontrak di `CLAUDE.md`
- [ ] Struktur file mengikuti arsitektur folder `src/`
- [ ] Implementasi tetap sederhana, modular, dan mudah dipakai ulang
- [ ] State, hooks, dan utils aman dipakai untuk flow online dan offline sederhana

---

## Phase 1 - Project Bootstrap

### Story 1.1 Project bootstrap

Dependencies: none

- [ ] Audit dependency project saat ini terhadap kebutuhan di `CLAUDE.md`
- [ ] Tambahkan dependency inti yang memang belum tersedia
- [ ] Pastikan env frontend memakai prefix `EXPO_PUBLIC_*`
- [ ] Siapkan struktur folder `src/` sesuai arsitektur target
- [ ] Tambahkan placeholder/barrel file bila perlu agar struktur jelas
- [ ] Tambahkan konstanta konfigurasi dasar untuk API, GPS, dan app config
- [ ] Pastikan project tetap buildable setelah bootstrap
- [ ] Dokumentasikan hasil bootstrap singkat jika diperlukan

---

## Phase 2 - Shared Models and Constants

### Story 2.1 Shared types

Dependencies: Story 1.1

- [ ] Buat `src/types/index.ts`
- [ ] Definisikan `VehicleType`
- [ ] Definisikan type `User`
- [ ] Definisikan type `Vehicle`
- [ ] Definisikan type `RideMetrics`
- [ ] Definisikan type `Ride`
- [ ] Definisikan type `GPSPoint`
- [ ] Definisikan type `LeaderboardEntry`
- [ ] Definisikan type `FeedItem`
- [ ] Pastikan field mengikuti snake_case backend contract

### Story 2.2 Vehicle constants

Dependencies: Story 2.1

- [ ] Buat `src/constants/vehicles.ts`
- [ ] Definisikan config untuk `motor`
- [ ] Definisikan config untuk `mobil`
- [ ] Definisikan config untuk `sepeda`
- [ ] Tambahkan `label`, `color`, dan `bgColor`
- [ ] Tambahkan daftar metric card per tipe kendaraan
- [ ] Tandai metric highlight untuk kebutuhan share card dan live metrics
- [ ] Export sebagai constant typed object

---

## Phase 3 - API Layer

### Story 3.1 Shared API client

Dependencies: Story 1.1

- [ ] Buat `src/services/api.ts`
- [ ] Setup Axios instance dengan `baseURL`
- [ ] Tambahkan `timeout`
- [ ] Tambahkan request interceptor untuk `access_token`
- [ ] Tambahkan response interceptor untuk `401`
- [ ] Implement refresh token flow
- [ ] Retry request original setelah refresh berhasil
- [ ] Gagal refresh harus mengarah ke clear auth flow yang aman

### Story 3.2 Auth service

Dependencies: Story 3.1, Story 2.1

- [ ] Buat `src/services/auth.service.ts`
- [ ] Implement `register`
- [ ] Implement `login`
- [ ] Implement `refresh`
- [ ] Implement `logout`
- [ ] Implement `getMe`
- [ ] Pastikan typing response auth konsisten

### Story 3.3 Vehicles service

Dependencies: Story 3.1, Story 2.1

- [ ] Buat `src/services/vehicles.service.ts`
- [ ] Implement `list`
- [ ] Implement `create`
- [ ] Implement `update`
- [ ] Implement `delete`
- [ ] Pastikan payload dan response typed

### Story 3.4 Rides service

Dependencies: Story 3.1, Story 2.1

- [ ] Buat `src/services/rides.service.ts`
- [ ] Implement `start`
- [ ] Implement `stop`
- [ ] Implement `list`
- [ ] Implement `getById`
- [ ] Pastikan response start ride memuat `ride_id`, `started_at`, dan `ws_token`

### Story 3.5 Social service

Dependencies: Story 3.1, Story 2.1

- [ ] Buat `src/services/social.service.ts`
- [ ] Implement `getFeed`
- [ ] Implement `follow`
- [ ] Implement `unfollow`
- [ ] Implement `likeRide`
- [ ] Implement `commentRide`
- [ ] Implement `getProfile`

### Story 3.6 Leaderboard service

Dependencies: Story 3.1, Story 2.1

- [ ] Buat `src/services/leaderboard.service.ts`
- [ ] Implement `getGlobal`
- [ ] Implement `getFriends`
- [ ] Pastikan filter `vehicle_type` ditangani dengan benar

---

## Phase 4 - Global State

### Story 4.1 Auth store

Dependencies: Story 3.2

- [ ] Buat `src/stores/auth.store.ts`
- [ ] Simpan `user`
- [ ] Simpan `accessToken`
- [ ] Simpan `isAuthenticated`
- [ ] Implement `setAuth`
- [ ] Persist `access_token` ke `SecureStore`
- [ ] Persist `refresh_token` ke `SecureStore`
- [ ] Implement `logout`
- [ ] Implement `loadFromStorage`
- [ ] Clear state lokal saat logout atau restore gagal

### Story 4.2 Ride store

Dependencies: Story 2.1

- [ ] Buat `src/stores/ride.store.ts`
- [ ] Simpan `activeRideId`
- [ ] Simpan `wsToken`
- [ ] Simpan `vehicleType`
- [ ] Simpan live `metrics`
- [ ] Simpan `polylinePoints`
- [ ] Simpan `isRecording`
- [ ] Implement `startRide`
- [ ] Implement `updateMetrics`
- [ ] Implement `addPoint`
- [ ] Implement `stopRide`
- [ ] Batasi memori polyline point agar tidak tumbuh tak terkendali
- [ ] Persist `active_ride_id` untuk recovery sederhana

---

## Phase 5 - Utility Layer

### Story 5.1 Metrics utility

Dependencies: Story 2.1

- [ ] Buat `src/utils/metrics.ts`
- [ ] Implement helper hitung jarak jika diperlukan
- [ ] Implement helper `haversineKm`
- [ ] Implement helper format durasi
- [ ] Implement helper perhitungan kalori sederhana
- [ ] Implement helper elevasi jika dibutuhkan flow summary
- [ ] Pastikan boundary value tidak menghasilkan output aneh

### Story 5.2 Polyline utility

Dependencies: Story 2.1

- [ ] Buat `src/utils/polyline.ts`
- [ ] Implement decode Google encoded polyline
- [ ] Normalisasi titik ke area gambar/canvas
- [ ] Tambahkan downsampling sederhana jika dibutuhkan
- [ ] Pastikan fungsi bisa dipakai untuk share card dan live map
- [ ] Handle input kosong atau invalid dengan aman

### Story 5.3 GPS buffer utility

Dependencies: Story 2.1

- [ ] Buat `src/utils/gpsBuffer.ts`
- [ ] Setup SQLite database lokal
- [ ] Buat tabel buffer GPS
- [ ] Simpan point mentah dari background task
- [ ] Simpan point normalisasi dari flow live send
- [ ] Implement baca unsynced point per ride
- [ ] Implement mark point sebagai synced
- [ ] Implement clear point per ride
- [ ] Tambahkan index untuk hot query yang sering dipakai

---

## Phase 6 - Hooks Layer

### Story 6.1 Auth hook

Dependencies: Phase 3, Phase 4

- [ ] Buat `src/hooks/useAuth.ts`
- [ ] Compose auth service dan auth store
- [ ] Implement `register`
- [ ] Implement `login`
- [ ] Implement `logout`
- [ ] Implement `restoreSession`
- [ ] Restore token dari storage saat app launch
- [ ] Fetch `getMe` setelah token valid tersedia

### Story 6.2 GPS hook

Dependencies: Story 5.3

- [ ] Buat `src/hooks/useGPS.ts`
- [ ] Definisikan `LOCATION_TASK` di top-level module
- [ ] Register `TaskManager.defineTask(...)`
- [ ] Simpan GPS mentah dari background task ke `GPSBuffer.addRaw`
- [ ] Implement `requestPermissions`
- [ ] Tampilkan alert jika izin foreground ditolak
- [ ] Tambahkan aksi buka pengaturan sistem
- [ ] Implement `startTracking`
- [ ] Simpan ride aktif ke global marker sederhana
- [ ] Implement `stopTracking`
- [ ] Implement `getCurrentLocation`
- [ ] Gunakan `timeInterval: 5000` dan `distanceInterval: 10`

### Story 6.3 WebSocket hook

Dependencies: Story 4.2, Story 5.3

- [ ] Buat `src/hooks/useWebSocket.ts`
- [ ] Definisikan status `disconnected`, `connecting`, `connected`, `error`
- [ ] Buat koneksi WebSocket menggunakan `rideId` dan `wsToken`
- [ ] Implement `flushBuffer`
- [ ] Kirim ulang GPS buffer saat koneksi berhasil
- [ ] Update metrics saat menerima message `ack`
- [ ] Implement reconnect exponential backoff
- [ ] Implement `sendGPSPoint`
- [ ] Simpan point ke store untuk live polyline
- [ ] Fallback ke SQLite buffer saat socket belum open
- [ ] Implement `disconnect`
- [ ] Cleanup timer dan socket saat unmount
- [ ] Pastikan replay buffer tidak mudah kehilangan data saat reconnect

### Story 6.4 Share card hook

Dependencies: Story 2.2, Story 5.1, Story 5.2

- [ ] Buat `src/hooks/useShareCard.ts`
- [ ] Tambahkan state `isGenerating`
- [ ] Setup Skia canvas 1080 x 1920
- [ ] Render background berdasarkan `VEHICLE_CONFIG`
- [ ] Render polyline dari `route_summary.polyline`
- [ ] Render glow line, start marker, dan end marker
- [ ] Render judul dan tanggal ride
- [ ] Bangun metric card sesuai tipe kendaraan
- [ ] Export image ke base64
- [ ] Tulis file sementara ke cache
- [ ] Request media library permission saat share
- [ ] Simpan ke galeri jika diizinkan
- [ ] Buka native share sheet
- [ ] Hapus file sementara setelah selesai
- [ ] Pastikan share card expose `isGenerating`

### Story 6.5 Notifications hook

Dependencies: Story 3.1

- [ ] Buat `src/hooks/useNotifications.ts`
- [ ] Setup notification handler di top-level
- [ ] Implement `registerForPushNotifications`
- [ ] Minta permission notifikasi
- [ ] Ambil Expo push token
- [ ] Kirim token ke backend user endpoint

---

## Phase 7 - Integration and App Behavior

### Story 7.1 Auth flow integration

Dependencies: Phase 3, Phase 4, Story 6.1

- [ ] Hubungkan auth hook ke flow app startup
- [ ] Pastikan restore session dijalankan dari root flow
- [ ] Redirect state guest vs authenticated dengan jelas
- [ ] Pastikan logout membersihkan state dan token
- [ ] Pastikan error handling auth dasar tersedia

### Story 7.2 Ride recording integration

Dependencies: Story 6.2, Story 6.3, Story 5.3

- [ ] Hubungkan GPS hook dengan ride store
- [ ] Hubungkan WebSocket hook dengan active ride session
- [ ] Pastikan start ride menyalakan tracking dan socket
- [ ] Pastikan stop ride mematikan tracking dan socket
- [ ] Flush GPS buffer pada reconnect atau recovery yang valid
- [ ] Pastikan live polyline dan metrics terus ter-update
- [ ] Pastikan reconnect WebSocket memakai backoff hingga max 30 detik

### Story 7.3 Share and notification integration

Dependencies: Story 6.4, Story 6.5

- [ ] Hubungkan share card hook ke ride detail / summary flow
- [ ] Pastikan generate share card tanpa crash
- [ ] Hubungkan register push token ke onboarding atau authenticated startup flow
- [ ] Pastikan permission denial tidak merusak flow utama

---

## Phase 8 - Validation and QA

### Story 8.1 Utility and rendering validation

Dependencies: Story 5.2, Story 6.3, Story 6.4

- [ ] Validasi decode polyline untuk route sederhana
- [ ] Validasi live polyline tidak crash pada input kosong
- [ ] Validasi share card render untuk setiap tipe kendaraan
- [ ] Validasi metric highlight tampil sesuai config

### Story 8.2 Auth and session validation

Dependencies: Story 7.1

- [ ] Test register flow dasar
- [ ] Test login flow dasar
- [ ] Test restore session saat app dibuka ulang
- [ ] Test logout clear state dan token

### Story 8.3 Ride recording and offline recovery validation

Dependencies: Story 7.2

- [ ] Test start ride dan stop ride
- [ ] Test GPS buffer saat socket offline
- [ ] Test flush buffer saat koneksi kembali
- [ ] Test app recovery saat masih ada `active_ride_id`
- [ ] Test error handling dasar untuk auth, GPS, WebSocket, dan share tersedia

### Story 8.4 Manual validation deep link and recovery

Dependencies: Story 7.1, Story 7.2

- [ ] Test URL `trackride://`
- [ ] Test URL `https://trackride.app/u/{username}`
- [ ] Test URL `https://trackride.app/rides/{rideId}`
- [ ] Test app recovery saat masih ada `active_ride_id`

---

## Recommended Execution Order

1. Pertahankan hasil Phase 1 sebagai baseline implementasi
2. Kerjakan Phase 2 Shared Models and Constants
3. Kerjakan Phase 3 API Layer
4. Kerjakan Phase 4 Global State
5. Kerjakan Phase 5 Utility Layer
6. Kerjakan Phase 6 Hooks Layer
7. Kerjakan Phase 7 Integration and App Behavior
8. Tutup dengan Phase 8 Validation and QA

## Open Questions to Resolve

- [ ] Apakah response backend final benar-benar memakai field yang sama dengan contoh types di `CLAUDE.md`
- [ ] Apakah `username` atau `userId` yang akan dipakai permanen untuk profile public flow
- [ ] Apakah ride recovery cukup return `active_ride_id` atau perlu metadata tambahan
- [ ] Apakah share card nanti tetap memakai font default Skia atau custom font asset
- [ ] Apakah flush buffer WebSocket perlu batching jika jumlah point sangat banyak

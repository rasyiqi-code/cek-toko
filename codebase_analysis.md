# Technical Audit: CekToko Application

This document provides a comprehensive analysis of the CekToko codebase after the implementation of the **Offline First + Cloud Sync** architecture.

## 1. Architecture Overview

The application follows a modern, distributed architecture designed for high availability and offline resilience.

### Core Architecture Patterns:
- **Offline First**: All data creation and modification are first performed locally (Optimistic UI) and queued in IndexedDB.
- **Multi-Tenancy**: Data isolation is enforced at the database level using `storeId`, with middleware protection for routing.
- **PWA (Progressive Web App)**: Full support for offline loading and installation as a standalone app.
- **Cross-Platform Ready**: API utilities and authentication are configured to work seamlessly on Web, Android (Capacitor), and Desktop (Tauri).

---

## 2. Technical Component Breakdown

### I. Authentication & Session Management
- **Persistence**: Switched from browser cookies to **IndexedDB (via `idb-keyval`)**. This allows the app to maintain identity even when the back-end is unreachable.
- **Token Security**: Tokens are encoded as Base64 JSON objects containing:
  - `storeId` (for data isolation)
  - `storeValid` / `validUntil` (for license enforcement)
  - `role` (for RBAC)
- **Middleware Protections**: The `proxy.ts` layer acts as an application firewalls, enforcing:
  - License validity before allowing write access.
  - Role-based access (Owner vs. Penjaga).

### II. Data Synchronization Engine (`useSync`)
- **Queue System**: Uses a persistent `sync_queue` in IndexedDB.
- **Retry Logic**: Automatically attempts synchronization when a network connection is detected (`online` event).
- **Optimistic Updates**: UI updates immediately upon user action, providing a "Zero Latency" feel.
- **Sync Status**: Real-time feedback via the `OnlineStatus` component, showing "Syncing...", "Terhubung", or "Offline".

### III. Persistence Layer (Read Cache)
- **TanStack Query**: Integrated with `createSyncStoragePersister` using `localStorage`.
- **Performance**: Fetched data is cached locally, allowing lists (Products, Categories) to load instantly without a network request.

### IV. Service Worker (Offline Infrastructure)
- **Manual v5 SW**: Implemented a highly resilient manual Service Worker that:
  - Pre-caches all application routes (App Shell).
  - Handles redirects properly using `redirect: follow`.
  - Dynamically caches any visited pages using a *Stale-While-Revalidate* strategy.

---

## 3. Strengths & Scalability

### Robustness
- The app handles total network failure gracefully.
- Re-registration of the Service Worker is automated to prevent "stale version" issues.

### Security
- Data isolation via `storeId` ensures that one store cannot access another's data.
- License enforcement is checked both on the Client (for UI) and Server (for data actions).

### UX
- Premium aesthetics with glassmorphism and smooth micro-animations.
- Clear indicators for sync status and offline mode.

---

## 4. Recommendations for Future Development

> [!TIP]
> **Conflict Resolution**: Currently, the sync engine follows "Last Write Wins". For large teams, consider implementing a more advanced conflict resolution strategy if two users edit the same product offline.

> [!NOTE]
> **Asset Optimization**: As the product catalog grows, consider moving from `localStorage` to `IndexedDB` for the TanStack Query persister to handle larger data volumes (above 5MB).

> [!IMPORTANT]
> **Production Build**: Always use `bun run build` before testing offline functionality on mobile/desktop to ensure the Service Worker is optimally bundled.

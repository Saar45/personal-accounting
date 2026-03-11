# Personal Accounting App

## Vision
Premium personal finance app. Currently local-only MVP; future: banking API integration (salary/expense auto-import), cloud sync, multi-device support, and App Store release.

## Tech Stack
- React Native + Expo SDK 55 (TypeScript)
- Expo Router (file-based routing) for navigation
- expo-sqlite (async API) for local SQLite database
- Ionicons via @expo/vector-icons for all icons (no emojis)
- expo-linear-gradient, expo-blur for premium UI effects
- papaparse for CSV import/export (resolved to non-minified build via metro.config.js)
- date-fns for date utilities
- @react-native-community/datetimepicker for native date picker
- expo-sharing for CSV export sharing
- expo-local-authentication + expo-secure-store for biometric lock
- react-native-web + react-dom for web support (installed but expo-sqlite not web-compatible)

## Project Structure
- `app/` -- Expo Router screens and layouts only (no business logic here)
  - `app/(tabs)/` -- Tab screens: Dashboard, Transactions, Bills, Settings
  - `app/transaction/` -- New/Edit transaction screens
  - `app/bill/` -- New/Edit bill screens (with payment history)
  - `app/categories/` -- Category management (list, create, edit)
  - `app/budgets/` -- Budget management (list, create)
  - `app/recurring/` -- Recurring transaction management
- `src/db/` -- Database layer (singleton, CRUD operations, types, migrations)
  - `database.ts` -- DB init, table creation, seed, migration runner
  - `migrations.ts` -- Version-tracked migrations using PRAGMA user_version (v1-v6)
  - `transactions.ts`, `bills.ts`, `categories.ts`, `budgets.ts`, `recurring.ts`, `bill-payments.ts`
  - `types.ts` -- All TypeScript interfaces
- `src/components/` -- Reusable UI components
- `src/components/ui/` -- Design system primitives (Card, Button, Input, Badge, DatePickerField)
- `src/components/dashboard/` -- Dashboard widget cards (Balance, Bills, CashFlow, Spending, BudgetOverview)
- `src/hooks/` -- React hooks for data access (useDatabase, useTransactions, useBills, useBudgets, useRecurring, useBillPayments, useCategories, useBiometricLock)
- `src/utils/` -- Utility functions (currency, dates, CSV import/export)
- `src/constants/` -- Theme tokens, category definitions
- `metro.config.js` -- Custom resolver: papaparse → non-minified source, stream → shim
- `stream-shim.js` -- Empty shim for Node stream module (papaparse references it but we only use string parsing)

## Design Conventions
- Premium dark theme: background #0F0F13, surface #1A1A23, primary #6C5CE7
- All icons use Ionicons from @expo/vector-icons. Never use emojis.
- Cards: borderRadius 16, subtle shadows, surface background
- Typography: system font (San Francisco / Roboto), tabular-nums for amounts
- Currency: EUR formatted via Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

## Database
- Uses expo-sqlite async API: openDatabaseAsync, runAsync, getAllAsync, getFirstAsync, execAsync
- Migration system: PRAGMA user_version tracks schema version, migrations run sequentially on startup
- 6 tables: categories, transactions, bills, budgets, recurring_transactions, bill_payments
- All amounts stored as positive REAL values; type column distinguishes income vs expense
- Dates stored as ISO 8601 strings; date range queries use >= and < (not LIKE)
- Parameterized queries used everywhere (SQL injection safe)
- Indexes on transactions(date), transactions(type, date), transactions(category_id), bills(is_active, next_due_date), categories(type)

## Commands
- `npx expo start` -- Start dev server (iOS/Android only; web has expo-sqlite limitations)
- `npx expo start --clear` -- Start with cache cleared
- Press `i` in dev server to open iOS simulator

## Code Style
- Functional components with hooks only
- TypeScript strict mode
- StyleSheet.create for all styles (no inline style objects)
- Keep screen files thin -- delegate logic to hooks and components

## Known Issues
- papaparse.min.js causes Babel stack overflow; metro.config.js resolves to papaparse.js + stream-shim.js
- expo-sqlite web worker fails (wa-sqlite.wasm not found); use --no-web or mobile only

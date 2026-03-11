# Personal Accounting App

## Tech Stack
- React Native + Expo SDK 55 (TypeScript)
- Expo Router (file-based routing) for navigation
- expo-sqlite (async API) for local SQLite database
- Ionicons via @expo/vector-icons for all icons (no emojis)
- expo-linear-gradient, expo-blur for premium UI effects
- papaparse for CSV import
- date-fns for date utilities

## Project Structure
- `app/` -- Expo Router screens and layouts only (no business logic here)
- `src/db/` -- Database layer (singleton, CRUD operations, types)
- `src/components/` -- Reusable UI components
- `src/components/ui/` -- Design system primitives (Card, Button, Input, Badge)
- `src/components/dashboard/` -- Dashboard widget cards
- `src/hooks/` -- React hooks for data access
- `src/utils/` -- Utility functions (currency, dates, CSV parsing)
- `src/constants/` -- Theme tokens, category definitions

## Design Conventions
- Premium dark theme: background #0F0F13, surface #1A1A23, primary #6C5CE7
- All icons use Ionicons from @expo/vector-icons. Never use emojis.
- Cards: borderRadius 16, subtle shadows, surface background
- Typography: system font (San Francisco / Roboto), tabular-nums for amounts
- Currency: EUR formatted via Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

## Database
- Uses expo-sqlite async API: openDatabaseAsync, runAsync, getAllAsync, getFirstAsync, execAsync
- 3 tables: categories, transactions, bills
- All amounts stored as positive REAL values; type column distinguishes income vs expense
- Dates stored as ISO 8601 strings

## Commands
- `npx expo start` -- Start dev server
- `npx expo start --clear` -- Start with cache cleared

## Code Style
- Functional components with hooks only
- TypeScript strict mode
- StyleSheet.create for all styles (no inline style objects)
- Keep screen files thin -- delegate logic to hooks and components

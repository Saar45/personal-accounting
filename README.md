# Personal Accounting

[![CI](https://github.com/Saar45/personal-accounting/actions/workflows/ci.yml/badge.svg)](https://github.com/Saar45/personal-accounting/actions/workflows/ci.yml)

Premium personal finance app built with React Native and Expo.

## Tech Stack

- React Native + Expo SDK 55 (TypeScript)
- Expo Router (file-based navigation)
- expo-sqlite (local SQLite database)
- Ionicons via @expo/vector-icons

## Setup

```bash
npm install
npx expo start
```

Press `i` to open in iOS simulator or `a` for Android.

## Tests

```bash
npm test
npm run test:watch
```

## Features

- Dashboard with balance, cash flow, and spending overview
- Transaction management (income/expense) with search and filters
- Bill tracking with payment history and due date notifications
- Budget management with spending progress
- Recurring transactions (auto-generated on startup)
- Custom categories with icons
- CSV import/export
- Biometric lock (Face ID / Touch ID)

## Project Structure

```
app/           Expo Router screens and layouts
  (tabs)/      Tab screens: Dashboard, Transactions, Bills, Settings
  transaction/ New/Edit transaction
  bill/        New/Edit bill with payment history
  categories/  Category management
  budgets/     Budget management
  recurring/   Recurring transaction management
src/
  db/          Database layer (SQLite, migrations, CRUD)
  components/  Reusable UI components
  hooks/       React hooks for data access
  utils/       Currency, dates, CSV utilities
  constants/   Theme tokens, category definitions
```

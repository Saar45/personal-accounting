import React from 'react';

// We need to mock useDatabase since hooks depend on the DatabaseContext
// Instead of providing the full provider, we mock the hook directly
export const mockDatabaseContext = {
  isReady: true,
  refreshKey: 0,
  triggerRefresh: jest.fn(),
};

jest.mock('../useDatabase', () => ({
  useDatabase: jest.fn(() => mockDatabaseContext),
  DatabaseProvider: ({ children }: { children: React.ReactNode }) => children,
}));

export function setDatabaseReady(ready: boolean) {
  mockDatabaseContext.isReady = ready;
}

export function simulateRefresh() {
  mockDatabaseContext.refreshKey += 1;
}

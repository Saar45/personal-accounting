export function createMockDb() {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    execAsync: jest.fn().mockResolvedValue(undefined),
    withExclusiveTransactionAsync: jest.fn(async (cb: (txn: any) => Promise<void>) => {
      const txn = {
        runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      };
      await cb(txn);
      return txn;
    }),
  };
}

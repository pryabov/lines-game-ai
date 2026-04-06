/**
 * Sets up a mock localStorage for testing persistence behavior.
 * Call reset() in afterEach to clean state between tests.
 */
export const setupLocalStorageMock = () => {
  let store: Record<string, string> = {};

  const mock: Storage = {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mock,
    writable: true,
    configurable: true,
  });

  return {
    mock,
    reset: () => {
      store = {};
      jest.clearAllMocks();
    },
    getStore: () => ({ ...store }),
    setStore: (data: Record<string, string>) => {
      store = { ...data };
    },
  };
};

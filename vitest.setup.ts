import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase in unit tests so tests run lightning-fast without network timeouts
vi.mock('@/lib/database/supabase', () => {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: new Error('Mock table not found') }),
    then: vi.fn((resolve) => resolve({ data: null, error: new Error('Mock error') })),
  };

  return {
    supabase: {
      from: vi.fn(() => mockQueryBuilder),
    },
  };
});

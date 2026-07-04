import { describe, expect, it } from '@jest/globals';

import { cn } from '@/lib/utils';

// Trivialer, nativ-freier Smoke-Test (nur pure JS: clsx + tailwind-merge).
describe('cn (className merge)', () => {
  it('lets the last conflicting Tailwind class win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('drops falsy conditional classes', () => {
    expect(cn('base', false, undefined, 'extra')).toBe('base extra');
  });
});

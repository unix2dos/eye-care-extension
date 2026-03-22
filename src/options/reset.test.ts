import { describe, expect, it, vi } from 'vitest';

import { RESET_CONFIRMATION_MESSAGE, shouldResetLocalData } from './reset';

describe('shouldResetLocalData', () => {
  it('shows the reset confirmation message and returns the confirm result', () => {
    const confirm = vi.fn(() => true);

    expect(shouldResetLocalData(confirm)).toBe(true);
    expect(confirm).toHaveBeenCalledWith(RESET_CONFIRMATION_MESSAGE);
  });

  it('aborts when the user cancels the confirmation', () => {
    const confirm = vi.fn(() => false);

    expect(shouldResetLocalData(confirm)).toBe(false);
  });
});

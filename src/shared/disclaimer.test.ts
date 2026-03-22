import { describe, expect, it } from 'vitest';

import {
  DISCOMFORT_NOTICE,
  DOCTOR_PRIORITY_NOTICE,
  getOptionsHealthNoticeLines,
  getPopupHealthDisclaimer,
  LOCAL_PRIVACY_NOTICE,
  MEDICAL_DISCLAIMER_SUMMARY
} from './disclaimer';

describe('disclaimer copy', () => {
  it('keeps the popup disclaimer concise but medically explicit', () => {
    expect(getPopupHealthDisclaimer()).toContain(MEDICAL_DISCLAIMER_SUMMARY);
    expect(getPopupHealthDisclaimer()).toContain(DOCTOR_PRIORITY_NOTICE);
  });

  it('returns the full notice block for options', () => {
    expect(getOptionsHealthNoticeLines()).toEqual([
      MEDICAL_DISCLAIMER_SUMMARY,
      DOCTOR_PRIORITY_NOTICE,
      DISCOMFORT_NOTICE,
      LOCAL_PRIVACY_NOTICE
    ]);
  });
});

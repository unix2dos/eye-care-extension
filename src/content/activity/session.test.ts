import { ActiveReadingSession } from './session';

describe('ActiveReadingSession', () => {
  it('becomes active after interaction and expires after inactivity', () => {
    const session = new ActiveReadingSession(180_000);

    session.markInteraction(1_000);

    expect(session.isActive(60_000)).toBe(true);
    expect(session.getActiveReadingSince(60_000)).toBe(1_000);
    expect(session.isActive(181_001)).toBe(false);
  });

  it('pauses immediately when the page is hidden', () => {
    const session = new ActiveReadingSession(180_000);

    session.markInteraction(1_000);
    session.setVisibility(false, 5_000);

    expect(session.isActive(5_001)).toBe(false);
    expect(session.getActiveReadingSince(5_001)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { BREAK_GUIDE_STEPS, createBreakGuideState } from './break-guide';

describe('createBreakGuideState', () => {
  it('maps a 20 second countdown across the four guide steps', () => {
    expect(createBreakGuideState({ countdownTotalSeconds: 20, remainingSeconds: 20 }).heading).toBe('先看远处');
    expect(createBreakGuideState({ countdownTotalSeconds: 20, remainingSeconds: 15 }).heading).toBe('左右转动视线');
    expect(createBreakGuideState({ countdownTotalSeconds: 20, remainingSeconds: 10 }).heading).toBe('上下转动视线');
    expect(createBreakGuideState({ countdownTotalSeconds: 20, remainingSeconds: 5 }).heading).toBe('闭眼深呼吸');
  });

  it('returns a generic guide when no countdown is active', () => {
    const state = createBreakGuideState();

    expect(state.heading).toBe('跟着做一轮眼部放松');
    expect(state.activeStepIndex).toBe(0);
    expect(state.steps).toEqual(BREAK_GUIDE_STEPS);
  });

  it('switches to text-only guidance when motion should be reduced', () => {
    const state = createBreakGuideState({
      countdownTotalSeconds: 20,
      remainingSeconds: 12,
      motionReduced: true
    });

    expect(state.motionReduced).toBe(true);
    expect(state.heading).toBe('按顺序完成下面 4 步');
    expect(state.steps).toHaveLength(4);
  });
});

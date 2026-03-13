import { describe, expect, it } from 'vitest';

import { classifyRuntimeIssue, getRuntimeIssueCopy } from './issues';

describe('classifyRuntimeIssue', () => {
  it('maps browser camera errors to stable runtime issue codes', () => {
    const denied = new Error('Permission denied');
    denied.name = 'NotAllowedError';

    const missing = new Error('No camera found');
    missing.name = 'NotFoundError';

    const busy = new Error('Device busy');
    busy.name = 'NotReadableError';

    expect(classifyRuntimeIssue(denied)).toBe('permission-denied');
    expect(classifyRuntimeIssue(missing)).toBe('device-unavailable');
    expect(classifyRuntimeIssue(busy)).toBe('device-unavailable');
    expect(classifyRuntimeIssue(new Error('Camera API unavailable'))).toBe('browser-unsupported');
    expect(classifyRuntimeIssue(new Error('mediapipe load failed'))).toBe('vision-load-failed');
  });
});

describe('getRuntimeIssueCopy', () => {
  it('returns user-readable copy for popup, overlay, and options guidance', () => {
    expect(getRuntimeIssueCopy('permission-denied')).toMatchObject({
      overlayMessage: '摄像头权限被拒绝，已切换为定时提醒模式。',
      popupSummary: '摄像头权限被拒绝，当前为定时提醒',
      optionsGuidance: '请在当前站点的摄像头权限里选择允许，然后刷新页面重试。'
    });
    expect(getRuntimeIssueCopy('vision-load-failed')).toMatchObject({
      overlayMessage: '视觉检测组件加载失败，已切换为定时提醒模式。'
    });
    expect(getRuntimeIssueCopy('calibration-failed')).toMatchObject({
      overlayMessage: '校准未完成，已切换为定时提醒模式。'
    });
  });
});

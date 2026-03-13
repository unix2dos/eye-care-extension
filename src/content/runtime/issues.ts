import type { RuntimeIssueCode } from '../../shared/types';

interface RuntimeIssueCopy {
  title: string;
  overlayMessage: string;
  popupSummary: string | null;
  optionsGuidance: string;
}

export class RuntimeStartupError extends Error {
  constructor(
    readonly issue: Exclude<RuntimeIssueCode, 'none' | 'calibration-failed'>,
    message: string
  ) {
    super(message);
    this.name = 'RuntimeStartupError';
  }
}

function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : '';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
}

export function classifyRuntimeIssue(error: unknown): Exclude<RuntimeIssueCode, 'none' | 'calibration-failed'> {
  if (error instanceof RuntimeStartupError) {
    return error.issue;
  }

  const name = getErrorName(error);
  const message = getErrorMessage(error);

  if (name === 'NotAllowedError' || message.includes('permission')) {
    return 'permission-denied';
  }

  if (message.includes('camera api unavailable') || message.includes('getusermedia')) {
    return 'browser-unsupported';
  }

  if (
    name === 'NotFoundError' ||
    name === 'NotReadableError' ||
    name === 'AbortError' ||
    name === 'OverconstrainedError' ||
    message.includes('device') ||
    message.includes('camera busy') ||
    message.includes('no camera')
  ) {
    return 'device-unavailable';
  }

  return 'vision-load-failed';
}

const RUNTIME_ISSUE_COPY: Record<RuntimeIssueCode, RuntimeIssueCopy> = {
  none: {
    title: '运行正常',
    overlayMessage: '',
    popupSummary: null,
    optionsGuidance: '视觉检测正在运行，当前没有需要处理的启动问题。'
  },
  'permission-denied': {
    title: '摄像头权限被拒绝',
    overlayMessage: '摄像头权限被拒绝，已切换为定时提醒模式。',
    popupSummary: '摄像头权限被拒绝，当前为定时提醒',
    optionsGuidance: '请在当前站点的摄像头权限里选择允许，然后刷新页面重试。'
  },
  'browser-unsupported': {
    title: '浏览器不支持摄像头',
    overlayMessage: '当前浏览器环境不支持摄像头访问，已切换为定时提醒模式。',
    popupSummary: '浏览器不支持摄像头访问，当前为定时提醒',
    optionsGuidance: '请在支持摄像头访问的 Chrome 环境中打开微信读书页面后重试。'
  },
  'device-unavailable': {
    title: '没有可用的摄像头',
    overlayMessage: '没有可用的摄像头设备，已切换为定时提醒模式。',
    popupSummary: '没有可用的摄像头设备，当前为定时提醒',
    optionsGuidance: '请确认摄像头已连接且未被其他应用占用，然后刷新页面重试。'
  },
  'vision-load-failed': {
    title: '视觉检测组件加载失败',
    overlayMessage: '视觉检测组件加载失败，已切换为定时提醒模式。',
    popupSummary: '视觉检测组件加载失败，当前为定时提醒',
    optionsGuidance: '请刷新页面重试；如果仍失败，可以重新构建或重装扩展后再试。'
  },
  'calibration-failed': {
    title: '校准未完成',
    overlayMessage: '校准未完成，已切换为定时提醒模式。',
    popupSummary: '校准未完成，当前为定时提醒',
    optionsGuidance: '请保持正视屏幕并允许摄像头访问，然后重新校准。'
  }
};

export function getRuntimeIssueCopy(issue: RuntimeIssueCode): RuntimeIssueCopy {
  return RUNTIME_ISSUE_COPY[issue];
}

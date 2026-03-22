export interface BreakGuideStep {
  id: 'far-focus' | 'horizontal-scan' | 'vertical-scan' | 'blink-breathe';
  title: string;
  description: string;
  pupilOffsetX: number;
  pupilOffsetY: number;
}

export const BREAK_GUIDE_STEPS: readonly BreakGuideStep[] = [
  {
    id: 'far-focus',
    title: '先看远处',
    description: '把视线移到 20 英尺外，先从屏幕焦点里抽离出来。',
    pupilOffsetX: 0,
    pupilOffsetY: -3
  },
  {
    id: 'horizontal-scan',
    title: '左右转动视线',
    description: '缓慢看向左侧再看向右侧，动作轻一点，不用大幅转头。',
    pupilOffsetX: 6,
    pupilOffsetY: 0
  },
  {
    id: 'vertical-scan',
    title: '上下转动视线',
    description: '继续缓慢看向上方和下方，让眼周肌肉也活动起来。',
    pupilOffsetX: 0,
    pupilOffsetY: 6
  },
  {
    id: 'blink-breathe',
    title: '闭眼深呼吸',
    description: '轻轻闭眼，多眨几次，再做两次深呼吸，把肩颈也放松下来。',
    pupilOffsetX: 0,
    pupilOffsetY: 0
  }
] as const;

export interface BreakGuideState {
  heading: string;
  description: string;
  activeStepIndex: number;
  steps: readonly BreakGuideStep[];
  motionReduced: boolean;
}

export interface BreakGuideStateOptions {
  countdownTotalSeconds?: number;
  remainingSeconds?: number | null;
  motionReduced?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getActiveStepIndex(totalSeconds: number, remainingSeconds: number): number {
  const safeTotal = Math.max(1, totalSeconds);
  const elapsedSeconds = clamp(safeTotal - remainingSeconds, 0, safeTotal);
  const stepDuration = Math.max(1, Math.floor(safeTotal / BREAK_GUIDE_STEPS.length));

  return clamp(Math.floor(elapsedSeconds / stepDuration), 0, BREAK_GUIDE_STEPS.length - 1);
}

export function createBreakGuideState({
  countdownTotalSeconds,
  remainingSeconds = null,
  motionReduced = false
}: BreakGuideStateOptions = {}): BreakGuideState {
  if (motionReduced) {
    return {
      heading: '按顺序完成下面 4 步',
      description: '不播放动画，只保留文字步骤，方便你按自己的节奏完成休息。',
      activeStepIndex: 0,
      steps: BREAK_GUIDE_STEPS,
      motionReduced: true
    };
  }

  const hasCountdown =
    typeof countdownTotalSeconds === 'number' &&
    countdownTotalSeconds > 0 &&
    typeof remainingSeconds === 'number' &&
    remainingSeconds >= 0;

  if (!hasCountdown) {
    return {
      heading: '跟着做一轮眼部放松',
      description: '先看远处，再左右和上下转动视线，最后闭眼深呼吸。',
      activeStepIndex: 0,
      steps: BREAK_GUIDE_STEPS,
      motionReduced: false
    };
  }

  const activeStepIndex = getActiveStepIndex(countdownTotalSeconds, remainingSeconds);
  const activeStep = BREAK_GUIDE_STEPS[activeStepIndex];

  return {
    heading: activeStep.title,
    description: activeStep.description,
    activeStepIndex,
    steps: BREAK_GUIDE_STEPS,
    motionReduced
  };
}

export interface EyePoint {
  x: number;
  y: number;
  z?: number;
}

const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144] as const;
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380] as const;

function distance(first: EyePoint, second: EyePoint): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function calculateEyeAspectRatio(points: [EyePoint, EyePoint, EyePoint, EyePoint, EyePoint, EyePoint]): number {
  const vertical = distance(points[1], points[5]) + distance(points[2], points[4]);
  const horizontal = 2 * distance(points[0], points[3]);
  return horizontal === 0 ? 0 : vertical / horizontal;
}

function pickEyePoints(landmarks: EyePoint[], indices: readonly number[]): [EyePoint, EyePoint, EyePoint, EyePoint, EyePoint, EyePoint] | null {
  const points = indices.map((index) => landmarks[index]);
  if (points.some((point) => point === undefined)) {
    return null;
  }

  return points as [EyePoint, EyePoint, EyePoint, EyePoint, EyePoint, EyePoint];
}

export function calculateAverageFaceEar(landmarks: EyePoint[]): number | null {
  const left = pickEyePoints(landmarks, LEFT_EYE_INDICES);
  const right = pickEyePoints(landmarks, RIGHT_EYE_INDICES);

  if (!left || !right) {
    return null;
  }

  return (calculateEyeAspectRatio(left) + calculateEyeAspectRatio(right)) / 2;
}

export class BlinkDetector {
  private closed = false;

  constructor(private readonly defaultThreshold = 0.22) {}

  update(ear: number | null, threshold = this.defaultThreshold): boolean {
    if (ear === null) {
      return false;
    }

    if (!this.closed && ear < threshold) {
      this.closed = true;
      return false;
    }

    if (this.closed && ear >= threshold) {
      this.closed = false;
      return true;
    }

    return false;
  }

  reset(): void {
    this.closed = false;
  }
}

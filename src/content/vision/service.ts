import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { CalibrationProfile } from '../../shared/types';
import { BlinkDetector, calculateAverageFaceEar } from './ear';
import type { VisionObservation } from '../runtime/controller';
import { getVisionAssetUrls } from './assets';

export class MediaPipeVisionService {
  private landmarker: FaceLandmarker | null = null;
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private blinkDetector = new BlinkDetector();
  private blinkThreshold = 0.22;

  async start(calibration: CalibrationProfile | null = null): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera API unavailable');
    }

    const assetUrls = getVisionAssetUrls();
    const vision = await FilesetResolver.forVisionTasks(assetUrls.wasmBaseUrl);
    this.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: assetUrls.modelAssetUrl,
        delegate: 'CPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1
    });

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });

    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.srcObject = this.stream;
    await this.video.play();

    if (calibration?.blinkThreshold) {
      this.blinkThreshold = calibration.blinkThreshold;
    }
  }

  async sample(now = performance.now()): Promise<VisionObservation> {
    if (!this.landmarker || !this.video || this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return {
        now,
        faceDetected: false,
        blinkDetected: false,
        ear: null
      };
    }

    const result = this.landmarker.detectForVideo(this.video, now);
    const landmarks = result.faceLandmarks?.[0];
    if (!landmarks) {
      return {
        now,
        faceDetected: false,
        blinkDetected: false,
        ear: null
      };
    }

    const ear = calculateAverageFaceEar(landmarks);
    const blinkDetected = this.blinkDetector.update(ear, this.blinkThreshold);

    return {
      now,
      faceDetected: true,
      blinkDetected,
      ear
    };
  }

  setBlinkThreshold(threshold: number): void {
    this.blinkThreshold = threshold;
  }

  async stop(): Promise<void> {
    this.landmarker?.close();
    this.landmarker = null;
    this.blinkDetector.reset();

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}

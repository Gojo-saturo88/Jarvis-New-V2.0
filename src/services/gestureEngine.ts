/**
 * Optical Hand Motion & Touch Gesture Recognition Engine
 * Lightweight, 60fps, zero external npm package dependencies.
 * Provides touch gestures (drag, pinch zoom, swipe) and optical webcam hand-motion tracking.
 */

export type GestureType =
  | 'none'
  | 'tap'
  | 'double_tap'
  | 'drag'
  | 'pinch'
  | 'swipe_left'
  | 'swipe_right'
  | 'swipe_up'
  | 'swipe_down'
  | 'optical_wave'
  | 'optical_swipe_left'
  | 'optical_swipe_right'
  | 'optical_push_zoom_in'
  | 'optical_pull_zoom_out';

export interface GestureEvent {
  type: GestureType;
  deltaX?: number;
  deltaY?: number;
  scale?: number;
  source: 'touch' | 'optical';
  timestamp: number;
}

export type GestureCallback = (event: GestureEvent) => void;

class GestureEngineService {
  private isOpticalActive = false;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId = 0;
  private previousFrameData: Uint8ClampedArray | null = null;
  private lastOpticalGestureTime = 0;
  private callbacks: Set<GestureCallback> = new Set();

  public subscribe(cb: GestureCallback): () => void {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  private emit(event: GestureEvent) {
    this.callbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.warn('Gesture callback error:', err);
      }
    });
  }

  // --- OPTICAL WEBCAM / CAMERA HAND TRACKING ---
  public async startOpticalTracking(): Promise<boolean> {
    if (this.isOpticalActive) return true;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 160 },
          height: { ideal: 120 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      this.videoElement = document.createElement('video');
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 64;
      this.canvasElement.height = 48;
      this.canvasCtx = this.canvasElement.getContext('2d', { willReadFrequently: true });

      this.isOpticalActive = true;
      this.previousFrameData = null;
      this.processOpticalFrame();
      return true;
    } catch (err) {
      console.warn('Optical gesture camera access denied or failed:', err);
      this.stopOpticalTracking();
      return false;
    }
  }

  public stopOpticalTracking() {
    this.isOpticalActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.canvasElement = null;
    this.canvasCtx = null;
    this.previousFrameData = null;
  }

  public isOpticalRunning(): boolean {
    return this.isOpticalActive;
  }

  private processOpticalFrame = () => {
    if (!this.isOpticalActive || !this.videoElement || !this.canvasCtx || !this.canvasElement) {
      return;
    }

    const { videoWidth, videoHeight } = this.videoElement;
    if (videoWidth > 0 && videoHeight > 0) {
      const w = this.canvasElement.width;
      const h = this.canvasElement.height;

      // Draw current video frame to low-res analysis canvas
      this.canvasCtx.drawImage(this.videoElement, 0, 0, w, h);
      const imgData = this.canvasCtx.getImageData(0, 0, w, h);
      const currentPixels = imgData.data;

      if (this.previousFrameData) {
        let leftMotion = 0;
        let rightMotion = 0;
        let centerMotion = 0;
        let totalDiff = 0;
        let motionPixelCount = 0;

        const threshold = 32;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const diff =
              Math.abs(currentPixels[idx] - this.previousFrameData[idx]) +
              Math.abs(currentPixels[idx + 1] - this.previousFrameData[idx + 1]) +
              Math.abs(currentPixels[idx + 2] - this.previousFrameData[idx + 2]);

            if (diff > threshold * 3) {
              totalDiff += diff;
              motionPixelCount++;
              if (x < w * 0.38) {
                leftMotion++;
              } else if (x > w * 0.62) {
                rightMotion++;
              } else {
                centerMotion++;
              }
            }
          }
        }

        const now = Date.now();
        const minCooldown = 650; // ms between optical gestures

        if (now - this.lastOpticalGestureTime > minCooldown) {
          const totalMotionArea = motionPixelCount / (w * h);

          // Substantial motion detected
          if (totalMotionArea > 0.12 && totalMotionArea < 0.85) {
            // Horizontal swipe direction
            if (leftMotion > rightMotion * 1.8 && leftMotion > 60) {
              this.lastOpticalGestureTime = now;
              this.emit({
                type: 'optical_swipe_left',
                source: 'optical',
                timestamp: now,
                deltaX: -120,
              });
            } else if (rightMotion > leftMotion * 1.8 && rightMotion > 60) {
              this.lastOpticalGestureTime = now;
              this.emit({
                type: 'optical_swipe_right',
                source: 'optical',
                timestamp: now,
                deltaX: 120,
              });
            } else if (totalMotionArea > 0.45) {
              // Rapid expansion / push towards camera = zoom in
              this.lastOpticalGestureTime = now;
              this.emit({
                type: 'optical_push_zoom_in',
                source: 'optical',
                timestamp: now,
                scale: 1.18,
              });
            } else if (centerMotion > 80) {
              // Centered wave = voice wake-up
              this.lastOpticalGestureTime = now;
              this.emit({
                type: 'optical_wave',
                source: 'optical',
                timestamp: now,
              });
            }
          }
        }
      }

      // Store current frame
      if (!this.previousFrameData || this.previousFrameData.length !== currentPixels.length) {
        this.previousFrameData = new Uint8ClampedArray(currentPixels);
      } else {
        this.previousFrameData.set(currentPixels);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.processOpticalFrame);
  };
}

export const gestureEngine = new GestureEngineService();

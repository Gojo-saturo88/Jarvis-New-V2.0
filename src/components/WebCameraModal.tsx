import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Aperture, Check, AlertCircle } from 'lucide-react';
import { playSound } from '../services/soundEffects';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface WebCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebCameraModal: React.FC<WebCameraModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedPhoto(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsInitializing(true);
    setError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setError('Camera access not permitted or camera unavailable on this device.');
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(dataUrl);
      playSound('success');
    }
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[90vh]"
      className="holo-panel rounded-2xl flex flex-col border border-amber-500/40 shadow-2xl"
      accentColor="amber"
    >
        {/* Header */}
        <div className="p-3.5 border-b border-amber-500/20 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
                OPTICAL SENSOR MATRIX // CAMERA HUD
              </h3>
              <p className="text-[10px] font-mono text-amber-400/80">
                STARK INDUSTRIES REAL-TIME WEBRTC OPTICAL FEED
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Display with Stark HUD Target Overlay */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[340px]">
          {error ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-stone-300 font-mono">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold font-mono text-xs cursor-pointer"
              >
                RETRY PERMISSIONS
              </button>
            </div>
          ) : capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhoto}
                alt="Captured Snapshot"
                className="max-h-[60vh] object-contain rounded-lg"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/70 border border-emerald-400 text-emerald-400 text-xs font-mono">
                SNAPSHOT SAVED
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover max-h-[65vh]"
              />

              {/* Stark Target Crosshair & HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                <div className="flex justify-between items-start text-[10px] font-mono text-amber-400">
                  <div className="space-y-1">
                    <div>FOCUS: AUTO</div>
                    <div>ISO: 100 // CALIBRATED</div>
                  </div>
                  <div>FACING: {facingMode.toUpperCase()}</div>
                </div>

                {/* Central Targeting Reticle */}
                <div className="self-center relative w-48 h-48 border border-amber-400/40 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 border border-amber-500/60 rounded-full animate-spin [animation-duration:15s]" />
                  <div className="w-4 h-4 border-2 border-amber-400" />
                  <div className="absolute top-0 w-1 h-3 bg-amber-400" />
                  <div className="absolute bottom-0 w-1 h-3 bg-amber-400" />
                  <div className="absolute left-0 w-3 h-1 bg-amber-400" />
                  <div className="absolute right-0 w-3 h-1 bg-amber-400" />
                </div>

                <div className="flex justify-between items-end text-[10px] font-mono text-amber-400">
                  <div>FPS: 60</div>
                  <div>LIVE SENSOR ACTIVE</div>
                </div>
              </div>
            </>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={toggleFacingMode}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>FLIP LENS</span>
          </button>

          {capturedPhoto ? (
            <button
              onClick={() => setCapturedPhoto(null)}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold font-mono text-xs transition-colors cursor-pointer"
            >
              TAKE ANOTHER
            </button>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={Boolean(error) || isInitializing}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:scale-105 active:scale-95 text-stone-950 font-bold font-mono text-xs gold-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Aperture className="w-4 h-4" />
              <span>CAPTURE</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-mono transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
    </HolographicModalWrapper>
  );
};

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CameraCaptureModal
 * Allows capturing photos directly from a laptop webcam or mobile camera.
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is dismissed
 * @param {function} onCapture - Callback receiving (File, previewUrl)
 */
export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // default to rear on mobile
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameraStream = useCallback(async () => {
    setCameraError(null);
    setIsInitializing(true);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or connection. Make sure you are using HTTPS or localhost.');
      setIsInitializing(false);
      return;
    }

    try {
      // First attempt with preferred facing mode
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback to basic video constraint if ideal facingMode throws OverconstrainedError
        console.warn('FacingMode constraint failed, falling back to any video device:', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err) {
      console.error('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Unable to start camera: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopCameraStream]);

  // Check if multiple video input devices are available
  useEffect(() => {
    if (!isOpen) return;
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        })
        .catch(() => {
          setHasMultipleCameras(false);
        });
    }
  }, [isOpen]);

  // Start / stop camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      return;
    }

    startCameraStream();

    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCameraStream, stopCameraStream]);

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera frame is not ready. Please wait a moment and try again.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setCameraError('Failed to capture picture. Please try again.');
            return;
          }
          const file = new File(
            [blob],
            `saree-camera-${Date.now()}.jpg`,
            { type: 'image/jpeg' }
          );
          const previewUrl = URL.createObjectURL(blob);
          stopCameraStream();
          onCapture(file, previewUrl);
          onClose();
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Capture error:', err);
      setCameraError('Failed to snap photo: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#C5A059]/40 bg-[#1A1817] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-serif text-base font-bold text-[#E5DAC8]">
              Camera / Webcam Viewfinder
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
            title="Close camera"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black min-h-[300px] sm:min-h-[360px]">
          {isInitializing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 text-sm text-[#E5DAC8]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent mb-2" />
              Starting camera...
            </div>
          )}

          {cameraError ? (
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50 text-xl text-red-400">
                ⚠
              </div>
              <p className="text-xs font-semibold text-red-300">{cameraError}</p>
              <button
                type="button"
                onClick={startCameraStream}
                className="mt-4 rounded-lg bg-[#C5A059] px-4 py-2 text-xs font-bold text-white hover:bg-[#b08e4d]"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full max-h-[60vh] w-full object-contain"
            />
          )}

          {/* Grid overlay for saree framing */}
          {!cameraError && !isInitializing && (
            <div className="pointer-events-none absolute inset-4 rounded-lg border border-white/20 border-dashed" />
          )}
        </div>

        {/* Shutter & Controls Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#141211] px-5 py-4">
          {hasMultipleCameras ? (
            <button
              type="button"
              onClick={handleFlipCamera}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-white/10"
              title="Switch Front/Rear Camera"
            >
              🔄 Switch
            </button>
          ) : (
            <div className="w-16" />
          )}

          {/* Main Shutter Button */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={!!cameraError || isInitializing}
            className="group flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#C5A059] bg-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            title="Click to take picture"
          >
            <div className="h-11 w-11 rounded-full bg-[#6B1626] transition-transform group-hover:scale-95" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

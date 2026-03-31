import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Camera } from "lucide-react";

interface CameraViewProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  useEffect(() => {
    let active = true;

    async function startCamera() {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsReady(false);
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera not supported in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (active) setIsReady(true);
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error ? err.message : "Camera access denied.";
          setError(message);
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `meal-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFlip = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 safe-top">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleFlip}
          disabled={!isReady}
        >
          <RefreshCw className="w-6 h-6" />
        </Button>
      </div>

      {/* Video feed */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Loading spinner */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center">
            <Camera className="w-16 h-16 text-white/40" />
            <p className="text-white text-sm">Could not access camera</p>
            <p className="text-white/60 text-xs">{error}</p>
            <Button variant="outline" className="mt-2" onClick={onClose}>
              Go Back
            </Button>
          </div>
        )}

        {/* Viewfinder guide */}
        {isReady && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-3/4 aspect-square border-2 border-white/30 rounded-2xl" />
          </div>
        )}
      </div>

      {/* Capture button */}
      <div className="pb-12 pt-6 flex justify-center bg-black/60">
        <button
          onClick={handleCapture}
          disabled={!isReady}
          aria-label="Capture photo"
          className="w-20 h-20 rounded-full bg-white border-[5px] border-white/50 shadow-lg
                     transition-transform active:scale-90 disabled:opacity-40
                     hover:scale-95"
        />
      </div>
    </div>
  );
}

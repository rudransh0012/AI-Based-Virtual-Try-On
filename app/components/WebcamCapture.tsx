import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, RotateCcw, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      if (image) {
        setImgSrc(image);
        setIsCameraActive(false);
      }
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result as string);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setImgSrc(null);
    setIsCameraActive(true);
  };

  const confirm = () => {
    if (imgSrc) {
      onCapture(imgSrc);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full relative bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm">
      <div className="relative w-full aspect-[3/4] md:aspect-[4/3] bg-neutral-900 flex items-center justify-center overflow-hidden">
        {isCameraActive ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="absolute inset-0 w-full h-full object-cover"
            videoConstraints={{ facingMode: "user" }}
            mirrored={true}
          />
        ) : (
          imgSrc && (
            <img 
              src={imgSrc} 
              alt="Captured" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          )
        )}
        
        {/* Grid Overlay for alignment guidance */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 rounded-full w-48 h-64" />
          </div>
        )}
      </div>

      <div className="absolute bottom-6 flex items-center gap-6 z-20">
        {isCameraActive ? (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
              title="Upload Photo"
            >
              <Upload className="w-6 h-6" />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={capture}
              className="p-6 bg-white rounded-full text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] border-4 border-transparent bg-clip-padding ring-4 ring-white/30"
              title="Capture Photo"
            >
              <Camera className="w-8 h-8" />
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={retake}
              className="px-6 py-3 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-all font-medium flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retake
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirm}
              className="px-6 py-3 bg-green-500/80 backdrop-blur-md rounded-full text-white hover:bg-green-600 transition-all font-medium flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
            >
              <Check className="w-4 h-4" /> Use Photo
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

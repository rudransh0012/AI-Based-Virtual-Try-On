import React, { useEffect, useRef, useState } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { createPoseModel, calculateBodyMetrics, BodyDimensions } from '../../utils/poseUtils';
import { Loader2, Move, Ruler, RotateCcw, Download, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface VirtualMirrorProps {
  userImage: string | null;
  dressImage: string | null;
}

export const VirtualMirror: React.FC<VirtualMirrorProps> = ({ userImage, dressImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseModel, setPoseModel] = useState<Pose | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bodyMetrics, setBodyMetrics] = useState<BodyDimensions | null>(null);
  
  // Manual adjustments
  const [scale, setScale] = useState(1.5);
  const [offsetY, setOffsetY] = useState(-20);
  const [offsetX, setOffsetX] = useState(0);

  // Load Pose Model
  useEffect(() => {
    const pose = createPoseModel();
    pose.onResults(onPoseResults);
    setPoseModel(pose);
    return () => {
      pose.close();
    };
  }, []);

  // Detect Pose when User Image changes
  useEffect(() => {
    if (userImage && poseModel) {
      detectPose();
    }
  }, [userImage, poseModel]);

  // Redraw when any input changes
  useEffect(() => {
    drawCanvas();
  }, [userImage, dressImage, bodyMetrics, scale, offsetY, offsetX]);

  const onPoseResults = (results: Results) => {
    if (!results.poseLandmarks) {
      toast.error("Could not detect body pose. Please try a clearer photo.");
      setIsProcessing(false);
      return;
    }
    
    // Calculate metrics
    const metrics = calculateBodyMetrics(results.poseLandmarks);
    setBodyMetrics(metrics);
    setIsProcessing(false);
  };

  const detectPose = async () => {
    if (!userImage || !poseModel) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = userImage;
    img.onload = async () => {
      await poseModel.send({ image: img });
    };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !userImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load User Image
    const userImg = new Image();
    userImg.crossOrigin = "anonymous";
    userImg.src = userImage;
    userImg.onload = () => {
      // Set canvas size to match image
      canvas.width = userImg.width;
      canvas.height = userImg.height;

      // Draw User
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(userImg, 0, 0);

      // Draw Dress if available and pose detected
      if (dressImage && bodyMetrics) {
        const dressImg = new Image();
        dressImg.crossOrigin = "anonymous";
        dressImg.src = dressImage;
        
        dressImg.onerror = () => {
          toast.error("Could not load dress image. Try uploading a local file.");
        };

        dressImg.onload = () => {
          // Calculate Dress Position & Size
          // Start with shoulder width
          // We convert normalized coordinates (0-1) to pixel coordinates
          const shoulderWidthPx = bodyMetrics.shoulderWidth * canvas.width;
          const centerXPx = bodyMetrics.center.x * canvas.width;
          const centerYPx = bodyMetrics.center.y * canvas.height;

          // Target width based on shoulder width + scale factor
          // Typically a shirt is wider than the shoulders
          const targetWidth = shoulderWidthPx * (2.2 * scale); 
          const aspectRatio = dressImg.height / dressImg.width;
          const targetHeight = targetWidth * aspectRatio;

          // Position: Center on the mid-shoulder point
          // Apply manual offsets
          const x = centerXPx - (targetWidth / 2) + offsetX;
          const y = centerYPx - (targetHeight * 0.2) + offsetY; // Heuristic: Neck is usually at top 20% of shirt image

          // Draw the dress
          ctx.save();
          
          // Optional: Rotate dress to match shoulder angle
          // ctx.translate(centerXPx, centerYPx);
          // ctx.rotate(-bodyMetrics.angle); // Angle needs to be inverted for canvas
          // ctx.translate(-centerXPx, -centerYPx);
          
          // Draw with smooth scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(dressImg, x, y, targetWidth, targetHeight);
          
          ctx.restore();
        };
      }
    };
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'my-virtual-tryon.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success("Image downloaded!");
    }
  };

  const shareImage = () => {
      if (navigator.share && canvasRef.current) {
          canvasRef.current.toBlob(blob => {
              if (blob) {
                  const file = new File([blob], 'tryon.png', { type: 'image/png' });
                  navigator.share({
                      title: 'My Virtual Try-On',
                      text: 'Check out this look created with AI!',
                      files: [file]
                  }).catch(console.error);
              }
          });
      } else {
          toast.info("Sharing not supported on this device/browser.");
      }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full relative">
      {/* Canvas Container */}
      <div className="relative w-full aspect-[3/4] md:aspect-[4/3] bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
        {!userImage ? (
          <div className="text-center text-neutral-500">
            <p className="text-lg">Waiting for user photo...</p>
          </div>
        ) : (
          <>
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                <p className="font-medium animate-pulse">Detecting Body Points...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {userImage && dressImage && (
        <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium text-sm">Fine Tune Fit</h4>
            <div className="flex gap-2">
                <button onClick={downloadImage} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                </button>
                <button onClick={shareImage} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Share">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Size
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 flex items-center gap-1">
                <Move className="w-3 h-3 rotate-90" /> Vertical
              </label>
              <input 
                type="range" 
                min="-200" 
                max="200" 
                step="5" 
                value={offsetY} 
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
             <div className="space-y-2">
              <label className="text-xs text-neutral-400 flex items-center gap-1">
                <Move className="w-3 h-3" /> Horizontal
              </label>
              <input 
                type="range" 
                min="-100" 
                max="100" 
                step="5" 
                value={offsetX} 
                onChange={(e) => setOffsetX(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

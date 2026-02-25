import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Shirt } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

interface DressSelectorProps {
  onSelect: (imageSrc: string) => void;
  selectedImage: string | null;
}

export const DressSelector: React.FC<DressSelectorProps> = ({ onSelect, selectedImage }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false
  });

  // Mock gallery images (simulating a database/store)
  const galleryImages = [
    "https://plus.unsplash.com/premium_photo-1673356301535-156f70dc0fb8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHRzaWhydHxlbnwwfHwwfHx8MA%3D%3D", // T-Shirt 1
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hpcnR8ZW58MHx8MHx8fDA%3D", // Shirt
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2hpcnR8ZW58MHx8MHx8fDA%3D", // Shirt 2
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-full bg-neutral-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
          <Shirt className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">Select Outfit</h3>
      </div>

      <div 
        {...getRootProps()} 
        className={clsx(
          "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group",
          isDragActive ? "border-purple-500 bg-purple-500/10" : "border-neutral-700 hover:border-purple-400/50 hover:bg-neutral-800/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="mb-4 p-4 bg-neutral-800 rounded-full group-hover:scale-110 transition-transform duration-300">
          <Upload className={clsx("w-6 h-6", isDragActive ? "text-purple-400" : "text-neutral-400")} />
        </div>
        <p className="text-sm font-medium text-neutral-300 mb-1">
          {isDragActive ? "Drop the dress here!" : "Upload Dress Image"}
        </p>
        <p className="text-xs text-neutral-500 max-w-[200px]">
          Supports PNG, JPG (Transparent background recommended)
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Quick Try-On
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {galleryImages.map((src, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(src)}
              className="relative aspect-square rounded-xl overflow-hidden border border-neutral-800 hover:border-purple-500/50 transition-colors group"
            >
              <img src={src} alt={`Dress ${idx + 1}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                <span className="text-[10px] font-medium text-white">Try On</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {selectedImage && (
        <div className="mt-auto p-4 bg-neutral-800/50 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-neutral-900 overflow-hidden border border-white/10">
            <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Selected Outfit</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Ready to wear
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

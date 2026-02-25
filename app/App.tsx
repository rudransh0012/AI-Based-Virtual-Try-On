import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { WebcamCapture } from './components/WebcamCapture';
import { DressSelector } from './components/DressSelector';
import { VirtualMirror } from './components/VirtualMirror';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Shirt, Camera, ArrowRight, Sparkles } from 'lucide-react';
import '../styles/custom.css';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [dressImage, setDressImage] = useState<string | null>(null);

  const handleStart = () => setHasStarted(true);

  return (
    <Layout>
      <Toaster position="top-center" theme="dark" />
      
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative bg-neutral-900 rounded-full p-6 ring-1 ring-white/10">
                <Sparkles className="w-12 h-12 text-purple-400" />
              </div>
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                Virtual Try-On <br />
                <span className="text-purple-500">AI Revolution</span>
              </h1>
              <p className="text-xl text-neutral-400">
                Experience the future of fashion. Try on any outfit instantly using our browser-based AI technology. No uploads to server, 100% private.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg flex items-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">Start Styling Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
            
            <div className="flex gap-8 text-sm text-neutral-500 pt-8">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" /> Real-time Camera
              </div>
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4" /> Any Outfit
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Powered
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]"
          >
            {/* Left Panel: User Input */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full">
              <div className="bg-neutral-900/50 rounded-2xl p-4 border border-white/5 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400" /> Your Look
                </h2>
                <div className="flex-1 min-h-0">
                  <WebcamCapture onCapture={setUserImage} />
                </div>
              </div>
            </div>

            {/* Center Panel: The Mirror */}
            <div className="lg:col-span-6 h-full">
               <div className="bg-neutral-900/50 rounded-2xl p-1 border border-white/5 h-full relative flex flex-col">
                <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                  AI Virtual Mirror
                </div>
                <div className="flex-1 overflow-hidden rounded-xl bg-black">
                  <VirtualMirror userImage={userImage} dressImage={dressImage} />
                </div>
              </div>
            </div>

            {/* Right Panel: Wardrobe */}
            <div className="lg:col-span-3 h-full">
              <div className="bg-neutral-900/50 rounded-2xl p-4 border border-white/5 h-full flex flex-col">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-pink-400" /> Wardrobe
                </h2>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  <DressSelector onSelect={setDressImage} selectedImage={dressImage} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

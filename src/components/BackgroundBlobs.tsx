/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface BackgroundBlobsProps {
  isDarkMode?: boolean;
}

export default function BackgroundBlobs({ isDarkMode = true }: BackgroundBlobsProps) {
  return (
    <div className={`fixed inset-0 -z-50 overflow-hidden ${
      isDarkMode 
        ? "bg-slate-950 selection:bg-emerald-500/30 selection:text-white" 
        : "bg-slate-50 selection:bg-indigo-500/10 selection:text-indigo-900"
    }`}>
      {/* Deep glass shade base */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDarkMode ? "bg-[#090d16]" : "bg-[#f1f5f9]/70"
      }`} />
      
      {/* Liquid blob 1 - Indigo-600 */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -80, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-500 ${
          isDarkMode ? "bg-indigo-600/30 opacity-80" : "bg-indigo-400/20 opacity-70"
        }`}
      />

      {/* Liquid blob 2 - Emerald-500 */}
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 60, -60, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-500 ${
          isDarkMode ? "bg-emerald-500/20 opacity-75" : "bg-emerald-300/15 opacity-65"
        }`}
      />

      {/* Liquid blob 3 - Sky-400 centered */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 50, -50, 0],
          scale: [1, 1.05, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-500 ${
          isDarkMode ? "bg-sky-400/10 opacity-60" : "bg-sky-300/10 opacity-50"
        }`}
      />

      {/* Glowing horizontal liquid streak */}
      <div className={`absolute top-10 left-10 right-10 h-0.5 blur-[1px] transition-all duration-500 ${
        isDarkMode ? "bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" : "bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent"
      }`} />
    </div>
  );
}

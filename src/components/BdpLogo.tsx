/*
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';

interface BdpLogoProps {
  className?: string;
  isDarkMode?: boolean;
}

export const BdpLogo: React.FC<BdpLogoProps> = ({ className = "h-12 w-auto", isDarkMode = false }) => {
  // A clean, high-fidelity SVG reconstruction of the BDP (Banco de Desarrollo Productivo S.A.M.) logo
  // Color hex codes:
  // Dark Blue: #004a8f
  // Light Blue / Cyan: #00b0d8

  const blueColor = "#004a8f";
  const cyanColor = "#00b0d8";

  // Function to calculate points for pointy-topped hexagons
  const getHexPoints = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
       const angle = (i * 60 - 30) * Math.PI / 180;
       points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
    }
    return points.join(' ');
  };

  return (
    <svg 
      viewBox="0 0 540 120" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Hexagon cluster on the left */}
      <g id="hexagon-cluster">
        {/* Top-Right deep blue hexagon */}
        <polygon 
          points={getHexPoints(118, 28, 16)} 
          fill={blueColor} 
          className="transition-all duration-300 hover:scale-110 cursor-pointer" 
          style={{ transformOrigin: "118px 28px" }}
        />
        {/* Middle-Left cyan hexagon */}
        <polygon 
          points={getHexPoints(64, 55, 16)} 
          fill={cyanColor}
          className="transition-all duration-300 hover:scale-110 cursor-pointer" 
          style={{ transformOrigin: "64px 55px" }}
        />
        {/* Middle-Right cyan hexagon */}
        <polygon 
          points={getHexPoints(123, 76, 16)} 
          fill={cyanColor}
          className="transition-all duration-300 hover:scale-110 cursor-pointer" 
          style={{ transformOrigin: "123px 76px" }}
        />
        {/* Far-Left cyan hexagon */}
        <polygon 
          points={getHexPoints(23, 76, 13)} 
          fill={cyanColor}
          className="transition-all duration-300 hover:scale-110 cursor-pointer" 
          style={{ transformOrigin: "23px 76px" }}
        />
        {/* Bottom deep blue hexagon */}
        <polygon 
          points={getHexPoints(64, 98, 16)} 
          fill={blueColor}
          className="transition-all duration-300 hover:scale-110 cursor-pointer" 
          style={{ transformOrigin: "64px 98px" }}
        />
      </g>

      {/* 2. Bold text "BDP" */}
      <g id="bdp-text-bold">
        {/* Letter 'B' (dark blue or white in dark mode) */}
        <path 
          d="M174 27h33c9.4 0 17 7.6 17 17 0 5.8-2.9 11-7.4 14.1 6.5 2.5 11.1 8.8 11.1 16.2 0 9.4-7.6 17-17 17h-36.7V27zm14.7 12.3v13h18.3c2.6 0 4.7-2.1 4.7-4.7 0-4.6-2.1-8.3-4.7-8.3h-18.3zm0 25.3v14h22c2.6 0 4.7-2.1 4.7-4.7s-2.1-9.3-4.7-9.3h-22z" 
          fill={isDarkMode ? "#ffffff" : blueColor} 
        />
        {/* Letter 'D' (dark blue or white in dark mode) */}
        <path 
          d="M251 27h29c19 0 34.3 14.3 34.3 32V61.3C314.3 79 299 91.3 280 91.3h-29V27zm14.7 12.3v39.7H280c9.5 0 17-7.5 17-17V61.3c0-9.5-10.5-22-20-22H265.7z" 
          fill={isDarkMode ? "#ffffff" : blueColor} 
        />
        {/* Letter 'P' (always cyan) */}
        <path 
          d="M328 27h37.7c11 0 20 9 20 20s-9 20-20 20H342.7v24.3H328V27zm14.7 12.3v15.3H365.7c4 0 7.3-3.3 7.3-7.3s-3.3-8-7.3-8H342.7z" 
          fill={cyanColor} 
        />
        {/* Letter 'SAM' */}
        <text 
          x="378" 
          y="91" 
          fill={isDarkMode ? "#ffffff" : blueColor} 
          fontSize="17.2" 
          fontWeight="900" 
          fontFamily="'Exo 2', sans-serif" 
          letterSpacing="0.4"
        >
          SAM
        </text>
      </g>

      {/* 3. Subtext "Banco de Desarrollo Productivo" */}
      <text 
        x="131" 
        y="113" 
        fill={isDarkMode ? "#ffffff" : blueColor} 
        fontSize="17.6" 
        fontWeight="800" 
        fontFamily="'Exo 2', sans-serif"
        letterSpacing="0.4"
      >
        Banco de Desarrollo Productivo
      </text>
    </svg>
  );
};

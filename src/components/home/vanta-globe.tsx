'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    VANTA: any
  }
}

export function VantaGlobe() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)

  useEffect(() => {
    if (!vantaRef.current) return

    let currentEffect: any = null
    const scripts: HTMLScriptElement[] = []

    // Function to initialize Vanta
    const initVanta = () => {
      if (window.VANTA && window.VANTA.GLOBE && vantaRef.current) {
        currentEffect = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xff5745,  // Primary-600: #ff5745 (matches website's main primary color)
          color2: 0xffa726, // Primary-400: #ffa726 (matches website's bright orange)
          size: 1.00,
          backgroundColor: 0x000000,  // Background color
          backgroundAlpha: 0.0        // Fully transparent to show background image
        })
        setVantaEffect(currentEffect)
      }
    }

    // Check if scripts already exist
    const threeScriptExists = document.querySelector('script[src*="three.js"]')
    const vantaScriptExists = document.querySelector('script[src*="vanta.globe"]')

    if (window.VANTA && window.VANTA.GLOBE) {
      // Already loaded, initialize immediately
      initVanta()
    } else if (!threeScriptExists) {
      // Load THREE.js first
      const threeScript = document.createElement('script')
      threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js'
      threeScript.async = true
      scripts.push(threeScript)
      
      threeScript.onload = () => {
        // Load Vanta GLOBE after THREE.js loads
        if (!vantaScriptExists) {
          const vantaScript = document.createElement('script')
          vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js'
          vantaScript.async = true
          scripts.push(vantaScript)
          
          vantaScript.onload = () => {
            initVanta()
          }
          
          document.head.appendChild(vantaScript)
        } else {
          // Vanta script already exists, wait a bit then initialize
          setTimeout(initVanta, 100)
        }
      }
      
      document.head.appendChild(threeScript)
    } else if (!vantaScriptExists) {
      // THREE.js exists but Vanta doesn't
      const vantaScript = document.createElement('script')
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js'
      vantaScript.async = true
      scripts.push(vantaScript)
      
      vantaScript.onload = () => {
        initVanta()
      }
      
      document.head.appendChild(vantaScript)
    } else {
      // Both scripts exist, wait a bit then initialize
      setTimeout(initVanta, 100)
    }

    return () => {
      if (currentEffect && currentEffect.destroy) {
        currentEffect.destroy()
      }
      // Don't remove scripts as they might be reused
    }
  }, [])

  return (
    <div 
      ref={vantaRef} 
      className="absolute inset-0 z-[2]"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

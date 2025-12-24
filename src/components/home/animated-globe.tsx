'use client'

import dynamic from 'next/dynamic'
import { Suspense, useRef, useEffect } from 'react'

// Dynamically import to avoid SSR issues with Three.js
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0" />
})

export function AnimatedGlobe() {
  const globeRef = useRef<any>(null)

  useEffect(() => {
    // Simple interval to check and set auto-rotate
    const checkInterval = setInterval(() => {
      if (globeRef.current) {
        try {
          const controls = globeRef.current.controls()
          if (controls) {
            controls.autoRotate = true
            controls.autoRotateSpeed = 1.0
            controls.enableDamping = true
            controls.dampingFactor = 0.1
            console.log('Controls set successfully:', controls.autoRotate)
            clearInterval(checkInterval) // Stop checking once set
          }
        } catch (error) {
          console.log('Waiting for globe to initialize...')
        }
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Globe positioned on the right side with gradient overlay */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[60%] h-full z-[1] bg-gradient-to-l from-black/50  to-transparent">
        <Suspense fallback={<div />}>
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            backgroundColor="rgba(0,0,0,0)"
            showGlobe={true}
            showAtmosphere={true}
            atmosphereColor="#4f46e5"
            atmosphereAltitude={0.15}
            enablePointerInteraction={true}
          />
        </Suspense>
      </div>
    </div>
  )
}


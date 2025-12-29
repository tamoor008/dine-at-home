"use client";

import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { SearchWidget } from "@/components/search/search-widget";
import { VantaGlobe } from "./vanta-globe";

export function HeroSection() {
  const { user } = useAuth();
  const isHost = user?.role === "host";

  return (
    <section className="relative h-[70vh] lg:h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {!isHost && (
        <div className="absolute inset-0 z-0">
          <Image
            src="https://plus.unsplash.com/premium_photo-1677666509899-7c8cbc69ddc5?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Elegant dinner table"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Dark gradient overlay for better text contrast and depth - behind animation */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/65 to-black/75" />

      {/* Vanta Globe Background - on top of overlay */}
      {!isHost && <VantaGlobe />}

      {/* Hero Content */}
      <div className="relative z-30 text-center text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {isHost ? (
          <>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-8">
              Welcome to Your <br />
              Host Dashboard
            </h1>
            <p className="text-lg lg:text-xl font-normal leading-relaxed mb-10 text-white/90">
              Manage your dinners, bookings, and create amazing dining
              experiences
            </p>
            <div className="max-w-2xl mx-auto">
              <a
                href="/host/dashboard"
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 text-lg"
              >
                Go to Dashboard
              </a>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl lg:text-6xl font-bold leading-tight mb-3 sm:mb-6">
              Find Your Next Authentic <br />
              Dining Experience
            </h1>
            <p className="text-sm sm:text-base lg:text-xl font-normal leading-relaxed mb-4 sm:mb-8 text-white/90">
              Connect with local hosts for unforgettable meals in their homes
            </p>

            {/* Search Widget - Only show for guests */}
            <div className="max-w-2xl mx-auto relative z-50">
              <SearchWidget variant="hero" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

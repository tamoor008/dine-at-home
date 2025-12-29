"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Heart, Star, Zap, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Dinner } from "@/types";

interface DinnerCardProps {
  dinner: Dinner;
  className?: string;
}

export function DinnerCard({ dinner, className = "" }: DinnerCardProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % dinner.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + dinner.images.length) % dinner.images.length
    );
  };

  const handleCardClick = () => {
    router.push(`/dinners/${dinner.id}`);
  };

  const handleQuickBook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/booking?dinner=${dinner.id}`);
  };

  return (
    <div
      className={`group cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] ${className}`}
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={
              dinner.images && dinner.images.length > 0
                ? dinner.images[currentImageIndex]
                : dinner.image
                ? dinner.image
                : `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&crop=center`
            }
            alt={dinner.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Image Navigation */}
          {dinner.images && dinner.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-8 h-8 p-0 rounded-full"
                onClick={prevImage}
              >
                <span className="text-lg">‹</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-8 h-8 p-0 rounded-full"
                onClick={nextImage}
              >
                <span className="text-lg">›</span>
              </Button>
            </>
          )}

          {/* Image Indicators */}
          {dinner.images && dinner.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
              {dinner.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 w-8 h-8 p-0 rounded-full bg-white/80 hover:bg-white transition-colors"
            onClick={handleFavoriteToggle}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            />
          </Button>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-black/70 text-white hover:bg-black/80 border-0">
              ${dinner.price} per person
            </Badge>
          </div>

          {/* Instant Book Badge */}
          {dinner.instantBook && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white text-gray-800 hover:bg-white border-0 flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span className="text-xs">Instant Book</span>
              </Badge>
            </div>
          )}

          {/* Superhost Badge */}
          {dinner.host?.superhost && (
            <div className="absolute top-12 left-3">
              <Badge className="bg-primary text-white hover:bg-primary border-0">
                Superhost
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Host Info */}
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                alt={dinner.host?.name || "Host"}
              />
              <AvatarFallback>{dinner.host?.name?.[0] || "H"}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Hosted by {dinner.host?.name || "Host"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
            {dinner.title}
          </h3>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(dinner.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{dinner.time}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {typeof dinner.location === "object"
                    ? dinner.location.neighborhood ||
                      dinner.location.city ||
                      "Location"
                    : dinner.location || "Location"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{dinner.available} spots left</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{dinner.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({dinner.reviewCount} reviews)
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {dinner.cuisine}
            </Badge>
          </div>

          {/* Quick Book Button */}
          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              onClick={handleQuickBook}
            >
              Quick Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

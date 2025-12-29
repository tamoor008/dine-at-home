"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ArrowLeft,
  Heart,
  Share,
  Star,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Zap,
  Shield,
  Award,
  ChefHat,
  Utensils,
  Wine,
  MessageSquare,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { Dinner, NavigationParams } from "@/types";

interface DinnerDetailProps {
  dinner: Dinner;
  onBook: (seats: number) => Promise<void>;
}

export function DinnerDetail({ dinner, onBook }: DinnerDetailProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Mock reviews data
  const reviews = [
    {
      id: "1",
      user: {
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face",
      },
      rating: 5,
      date: "2024-01-15",
      comment:
        "Absolutely incredible experience! Maria's pasta was life-changing and the atmosphere was so warm and welcoming.",
    },
    {
      id: "2",
      user: {
        name: "Mike Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      rating: 5,
      date: "2024-01-10",
      comment:
        "Perfect evening with great food and even better company. Maria is a fantastic host!",
    },
  ];

  const amenities = [
    { icon: ChefHat, label: "Professional chef" },
    { icon: Utensils, label: "All dietary restrictions accommodated" },
    { icon: Wine, label: "Wine pairing available" },
    { icon: Shield, label: "COVID safety measures" },
  ];

  const handleBooking = async () => {
    await onBook(selectedGuests);
  };

  const openCarousel = (index: number) => {
    setCarouselIndex(index);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  const nextImage = () => {
    setCarouselIndex((prev) => (prev + 1) % dinner.images.length);
  };

  const prevImage = () => {
    setCarouselIndex(
      (prev) => (prev - 1 + dinner.images.length) % dinner.images.length
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isCarouselOpen) return;

    if (e.key === "ArrowLeft") {
      prevImage();
    } else if (e.key === "ArrowRight") {
      nextImage();
    } else if (e.key === "Escape") {
      closeCarousel();
    }
  };

  return (
    <div
      className="min-h-screen bg-background pt-10"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{dinner.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{dinner.rating}</span>
                <span>({dinner.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {dinner.location.neighborhood}, {dinner.location.city}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorited(!isFavorited)}
              className="flex items-center space-x-2"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorited ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>Save</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
              <div className="col-span-4 sm:col-span-2 sm:row-span-2 relative">
                <Image
                  src={
                    dinner.images[0] ||
                    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop&crop=center"
                  }
                  alt={dinner.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover cursor-pointer hover:brightness-90 transition-all"
                  onClick={() => openCarousel(0)}
                />
              </div>
              {dinner.images.slice(1, 5).map((image, index) => (
                <div className="relative h-32" key={index}>
                  <Image
                    src={
                      image ||
                      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop&crop=center"
                    }
                    alt={`${dinner.title} ${index + 2}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => openCarousel(index + 1)}
                  />
                </div>
              ))}
            </div>

            {/* Host Info */}
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face"
                  alt={dinner.host.name}
                />
                <AvatarFallback>{dinner.host.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-lg">
                    Hosted by {dinner.host.name}
                  </h3>
                  {dinner.host.superhost && (
                    <Badge className="bg-primary text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Superhost
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Cooking for 5 years • 127 reviews • Usually responds within an
                  hour
                </p>
                <p className="text-sm">
                  "I'm passionate about sharing authentic Italian recipes that
                  have been passed down through my family for generations. Food
                  is love, and I can't wait to share that love with you!"
                </p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold text-xl mb-4">
                About this experience
              </h3>
              <div className="space-y-4 text-sm">
                <p>
                  Join me for an authentic Italian dinner experience in my cozy
                  Brooklyn home. We'll start with a welcome aperitivo, followed
                  by a 4-course meal featuring fresh handmade pasta, seasonal
                  vegetables from my garden, and traditional desserts.
                </p>
                <p>
                  This intimate dining experience is perfect for food lovers who
                  want to learn about Italian cooking traditions while enjoying
                  great company. I'll share stories about each dish and the
                  family recipes behind them.
                </p>
                <p>
                  Please let me know about any dietary restrictions when booking
                  - I'm happy to accommodate vegetarian, vegan, and gluten-free
                  guests with advance notice.
                </p>
              </div>
            </div>

            <Separator />

            {/* What's Included */}
            <div>
              <h3 className="font-semibold text-xl mb-4">What's included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <h3 className="font-semibold text-xl">Reviews</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{dinner.rating}</span>
                  <span className="text-muted-foreground">
                    ({dinner.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={review.user.avatar}
                          alt={review.user.name}
                        />
                        <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {review.user.name}
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="mt-6">
                Show all {dinner.reviewCount} reviews
              </Button>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-modal">
              <CardContent className="p-6">
                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="text-2xl font-semibold">
                    ${dinner.price}
                  </span>
                  <span className="text-muted-foreground">per person</span>
                </div>

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select date
                    </label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>

                  {/* Guest Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Guests
                    </label>
                    <Select
                      value={selectedGuests.toString()}
                      onValueChange={(value) =>
                        setSelectedGuests(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(dinner.capacity)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i + 1 === 1 ? "guest" : "guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span>
                      ${dinner.price} x {selectedGuests} guests
                    </span>
                    <span>${dinner.price * selectedGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>
                      ${Math.round(dinner.price * selectedGuests * 0.14)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      ${Math.round(dinner.price * selectedGuests * 1.14)}
                    </span>
                  </div>
                </div>

                {/* Booking Options */}
                <div className="space-y-3">
                  {dinner.instantBook ? (
                    <Button
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      onClick={handleBooking}
                      disabled={!selectedDate}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Reserve instantly
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={handleBooking}
                      disabled={!selectedDate}
                    >
                      Request to book
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message host
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    You won't be charged yet
                  </p>
                </div>

                {/* Safety Features */}
                <div className="mt-6 pt-4 border-t space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Identity verified host</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Secure payment system</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Carousel Modal */}
      {isCarouselOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeCarousel}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeCarousel}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          {/* Image */}
          <div
            className="relative max-w-7xl w-full h-full flex items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={dinner.images[carouselIndex]}
              alt={`${dinner.title} - Image ${carouselIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh] max-w-full"
            />
          </div>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {carouselIndex + 1} / {dinner.images.length}
          </div>
        </div>
      )}
    </div>
  );
}

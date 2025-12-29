"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DinnerCard } from "../dinner/dinner-card";
import { SearchWidget } from "./search-widget";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Filter,
  MapPin,
  Star,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  Search,
} from "lucide-react";

import { SearchParams, NavigationParams, Dinner } from "@/types";

interface SearchResultsProps {
  searchParams: SearchParams;
  initialDinners: Dinner[];
}

export function SearchResults({
  searchParams,
  initialDinners,
}: SearchResultsProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recommended");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [instantBookOnly, setInstantBookOnly] = useState(false);
  const [superhostOnly, setSuperhostOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Use props instead of mockData
  const dinners = initialDinners;

  // Get unique cuisines for filter (from current result set - simplistic approach)
  const cuisines = Array.from(new Set(dinners.map((dinner) => dinner.cuisine)));

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter and sort dinners
  const filteredDinners = useMemo(() => {
    let filtered = dinners.filter((dinner) => {
      // Price filter
      if (dinner.price < priceRange[0] || dinner.price > priceRange[1])
        return false;

      // Cuisine filter
      if (
        selectedCuisines.length > 0 &&
        !selectedCuisines.includes(dinner.cuisine)
      )
        return false;

      // Instant book filter
      if (instantBookOnly && !dinner.instantBook) return false;

      // Superhost filter
      if (superhostOnly && !dinner.host.superhost) return false;

      // Location filter (basic string matching)
      if (searchParams.location) {
        const location = searchParams.location.toLowerCase();
        const dinnerLocation =
          `${dinner.location.city} ${dinner.location.state} ${dinner.location.neighborhood}`.toLowerCase();
        if (!dinnerLocation.includes(location)) return false;
      }

      // Guest capacity filter
      if (searchParams.guests && dinner.capacity < searchParams.guests)
        return false;

      return true;
    });

    // Sort results
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "date":
        filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      default:
        // Keep recommended order (by rating then reviews)
        filtered.sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        });
    }

    return filtered;
  }, [
    dinners,
    priceRange,
    selectedCuisines,
    instantBookOnly,
    superhostOnly,
    searchParams,
    sortBy,
  ]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 200]);
    setSelectedCuisines([]);
    setInstantBookOnly(false);
    setSuperhostOnly(false);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Price per person</h3>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            onValueCommit={(value) => {
              // Update URL when user releases the slider
              const params = new URLSearchParams(window.location.search);
              params.set("minPrice", value[0].toString());
              params.set("maxPrice", value[1].toString());
              router.push(`?${params.toString()}`);
            }}
            max={200}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* <div>
        <h3 className="font-semibold mb-3">Cuisine Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {cuisines.map(cuisine => (
            <div key={cuisine} className="flex items-center space-x-2">
              <Checkbox
                id={cuisine}
                checked={selectedCuisines.includes(cuisine)}
                onCheckedChange={() => toggleCuisine(cuisine)}
              />
              <label 
                htmlFor={cuisine}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {cuisine}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Booking Options</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="instant-book"
              checked={instantBookOnly}
              onCheckedChange={(checkedState) => setInstantBookOnly(checkedState === true)}
            />
            <label htmlFor="instant-book" className="text-sm font-medium">
              Instant Book only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="superhost"
              checked={superhostOnly}
              onCheckedChange={(checked) => setSuperhostOnly(checked === true)}
            />
            <label htmlFor="superhost" className="text-sm font-medium">
              Superhost only
            </label>
          </div>
        </div>
      </div> */}

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear all filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile: Hero variant, Desktop: Compact variant */}
          <div className="block md:hidden">
            <SearchWidget
              variant="hero"
              initialParams={{
                location: searchParams.location,
                date: searchParams.date,
                guests: searchParams.guests,
              }}
            />
          </div>
          <div className="hidden md:block">
            <SearchWidget
              variant="compact"
              initialParams={{
                location: searchParams.location,
                date: searchParams.date,
                guests: searchParams.guests,
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block lg:w-80 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
              <FiltersContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-semibold">
                  {filteredDinners.length} dinner experiences
                  {searchParams.location && (
                    <span className="text-muted-foreground">
                      {" "}
                      in {searchParams.location}
                    </span>
                  )}
                </h1>
                {searchParams.date && (
                  <p className="text-muted-foreground mt-1">
                    {searchParams.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                    {searchParams.guests && ` • ${searchParams.guests} guests`}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {/* Mobile Filters */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <div className="px-4 py-6">
                      <h2 className="font-semibold mb-6">Filters</h2>
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="date">Soonest Date</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none border-r"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCuisines.length > 0 ||
              instantBookOnly ||
              superhostOnly ||
              priceRange[0] > 0 ||
              priceRange[1] < 200) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCuisines.map((cuisine) => (
                  <Badge
                    key={cuisine}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine} ×
                  </Badge>
                ))}
                {instantBookOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setInstantBookOnly(false)}
                  >
                    Instant Book ×
                  </Badge>
                )}
                {superhostOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setSuperhostOnly(false)}
                  >
                    Superhost ×
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 200) && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setPriceRange([0, 200])}
                  >
                    ${priceRange[0]} - ${priceRange[1]} ×
                  </Badge>
                )}
              </div>
            )}

            {/* Results Grid */}
            {filteredDinners.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredDinners.map((dinner) => (
                  <DinnerCard
                    key={dinner.id}
                    dinner={dinner}
                    className={
                      viewMode === "list" ? "md:flex md:space-x-4" : ""
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

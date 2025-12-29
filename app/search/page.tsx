import { Suspense } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { SearchResults } from "@/components/search/search-results";
import { BookingGuard } from "@/components/auth/booking-guard";
import { getDinners } from "@/lib/api";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const location =
    typeof searchParams.location === "string" ? searchParams.location : "";
  const dateStr =
    typeof searchParams.date === "string" ? searchParams.date : undefined;
  const guestsStr =
    typeof searchParams.guests === "string" ? searchParams.guests : "2";

  // New filters from URL
  const minPriceStr =
    typeof searchParams.minPrice === "string"
      ? searchParams.minPrice
      : undefined;
  const maxPriceStr =
    typeof searchParams.maxPrice === "string"
      ? searchParams.maxPrice
      : undefined;
  const seatsStr =
    typeof searchParams.seats === "string" ? searchParams.seats : undefined;

  // Fetch dinners from API
  const { items: dinners } = await getDinners({
    city: location, // Assuming location maps to city for now
    date: dateStr,
    minPrice: minPriceStr ? parseInt(minPriceStr) : undefined,
    maxPrice: maxPriceStr ? parseInt(maxPriceStr) : undefined,
    seats: seatsStr ? parseInt(seatsStr) : undefined,
    // guests param in UI usually maps to seats needed
    limit: 20,
  });

  // Construct SearchParams object for UI
  const searchParamsObj = {
    location,
    date: dateStr ? new Date(dateStr) : undefined,
    guests: parseInt(guestsStr),
  };

  return (
    <PageLayout>
      {/* Simplify structure: BookingGuard can wrap usage of booking features, 
          but for now we keep it around everything if that was the rule */}
      {/* Note: BookingGuard is a Client Component. It works fine here as a wrapper. */}
      <BookingGuard>
        <SearchResults
          initialDinners={dinners}
          searchParams={searchParamsObj}
        />
      </BookingGuard>
    </PageLayout>
  );
}

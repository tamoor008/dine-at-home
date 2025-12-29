import { Dinner } from "@/types";

const API_Base = process.env.NEXT_PUBLIC_API_URL;

if (!API_Base) {
  console.warn("NEXT_PUBLIC_API_URL is not defined");
}

interface GetDinnersParams {
  q?: string;
  city?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  limit?: number;
  after?: string;
}

interface GetDinnersResponse {
  items: Dinner[];
  page: {
    after: string | null;
  };
}

export async function getDinners(
  params: GetDinnersParams = {}
): Promise<GetDinnersResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.city) searchParams.set("city", params.city);
  if (params.date) searchParams.set("date", params.date);
  if (params.minPrice) searchParams.set("minPrice", params.minPrice.toString());
  if (params.maxPrice) searchParams.set("maxPrice", params.maxPrice.toString());
  if (params.seats) searchParams.set("seats", params.seats.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.after) searchParams.set("after", params.after);

  try {
    const response = await fetch(
      `${API_Base}/dinners?${searchParams.toString()}`,
      {
        method: "GET",
        // Headers removed to avoid unnecessary CORS preflight
        cache: "no-store", // Disable caching for now to ensure fresh data
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Log response for debugging
    console.log("[API] getDinners response:", JSON.stringify(data, null, 2));

    // Map API response to match Frontend Dinner type
    const mappedItems = data.items.map((item: any) => ({
      ...item,
      // API returns price as { amount, currency }, Frontend expects number
      price: typeof item.price === "object" ? item.price.amount : item.price,
      // Ensure images is always an array
      images: item.images || [],
      // Ensure other fields match if necessary
      date: item.date,
      host: item.host || {
        // Mock host if missing from listing (API listing might be lightweight)
        id: "unknown",
        name: "Unknown Host",
        avatar: null,
      },
    }));

    return {
      items: mappedItems,
      page: data.page,
    };
  } catch (error) {
    console.error("Failed to fetch dinners:", error);
    // Return empty result on error to prevent page crash
    return { items: [], page: { after: null } };
  }
}

export async function createDinner(dinnerData: any, token: string) {
  try {
    // Use local proxy to avoid CORS issues
    const response = await fetch("/api/dinners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dinnerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to create dinner: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating dinner:", error);
    throw error;
  }
}

export async function getMyBookings(token: string) {
  try {
    // Use local proxy to avoid CORS
    const response = await fetch(`/api/users/me/bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Gracefully handle 404/Empty if appropriate, or throw
      if (response.status === 404) return [];
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    // Return empty array to avoid crashing UI
    return [];
  }
}

export async function getDinnerById(id: string): Promise<Dinner | null> {
  try {
    // Use local proxy to avoid CORS
    const response = await fetch(`/api/dinners/${id}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }

    const item = await response.json();

    // Mapping logic
    return {
      ...item,
      price: typeof item.price === "object" ? item.price.amount : item.price,
      images: item.images || [],
      date: item.date,
      host: item.host || {
        id: "unknown",
        name: "Unknown Host",
        avatar: null,
      },
      guests: [],
    };
  } catch (error) {
    console.error(`Failed to fetch dinner ${id}:`, error);
    return null;
  }
}

export async function bookDinner(
  dinnerId: string,
  seats: number,
  token: string
) {
  try {
    // Use local proxy
    const response = await fetch(`/api/dinners/${dinnerId}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        seats,
        currency: "USD",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to book dinner: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error booking dinner:", error);
    throw error;
  }
}

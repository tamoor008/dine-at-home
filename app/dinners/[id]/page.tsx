"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { DinnerDetail } from "@/components/dinner/dinner-detail";
import { BookingGuard } from "@/components/auth/booking-guard";
import { useAuth } from "@/contexts/auth-context";
import { getDinnerById, bookDinner } from "@/lib/api";
import { Dinner } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DinnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);

  const [dinner, setDinner] = useState<Dinner | null>(null);
  const [loading, setLoading] = useState(true);

  async function handleBook(seats: number) {
    if (!session?.access_token) {
      toast.error("Please login to book a dinner");
      router.push("/auth/signin");
      return;
    }

    try {
      await bookDinner(id, seats, session.access_token);
      toast.success("Booking successful!");
      router.push("/profile?tab=bookings");
    } catch (error: any) {
      toast.error(error.message || "Failed to book dinner");
    }
  }

  useEffect(() => {
    async function fetchDinner() {
      if (!id) return;
      try {
        const data = await getDinnerById(id);
        setDinner(data);
      } catch (error) {
        console.error("Failed to fetch dinner details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDinner();
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!dinner) {
    return (
      <PageLayout>
        <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Dinner Not Found</h1>
          <p className="text-muted-foreground">
            The dinner experience you're looking for doesn't exist.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <BookingGuard>
      <PageLayout>
        <DinnerDetail dinner={dinner} onBook={handleBook} />
      </PageLayout>
    </BookingGuard>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, DollarSign, Clock } from "lucide-react";
import { getMyBookings, getDinnerById } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function MyBookingsPage() {
  const { session, user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!session?.access_token) return;
      try {
        const data = await getMyBookings(session.access_token);

        let rawBookings: any[] = [];
        if (Array.isArray(data)) {
          rawBookings = data;
        } else if (data && Array.isArray(data.items)) {
          rawBookings = data.items;
        } else if (
          data &&
          (Array.isArray(data.upcoming) || Array.isArray(data.past))
        ) {
          rawBookings = [...(data.upcoming || []), ...(data.past || [])];
        } else {
          console.warn("Unexpected bookings format:", data);
          rawBookings = [];
        }

        // Enrich bookings with dinner details if missing
        const enrichedBookings = await Promise.all(
          rawBookings.map(async (booking) => {
            // Use existing total price if available
            const price = booking.totalPrice
              ? booking.totalPrice
              : (booking.dinner?.price || 0) * (booking.seats || 1);

            // If dinner details are missing, fetch them
            if (!booking.dinner && booking.dinnerId) {
              try {
                const dinner = await getDinnerById(booking.dinnerId);
                return { ...booking, dinner, totalPrice: price };
              } catch (err) {
                console.error(
                  "Failed to fetch dinner details for booking",
                  booking.id
                );
                return { ...booking, totalPrice: price };
              }
            }
            return { ...booking, totalPrice: price };
          })
        );

        setBookings(enrichedBookings);
      } catch (error) {
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No upcoming bookings
              </h3>
              <p className="text-muted-foreground mb-6">
                You haven't booked any dinners yet. Explore our unique dining
                experiences!
              </p>
              <Link href="/dinners">
                <Button>Explore Dinners</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {booking.dinner?.title || "Dinner Reservation"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Booking ID: {booking.id}
                      </p>
                    </div>
                    <Badge
                      className={getStatusColor(booking.status || "pending")}
                    >
                      {booking.status || "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.dinner?.date || "TBD"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Time</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.dinner?.time || "TBD"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.dinner?.location?.city ||
                              "Location details provided upon confirmation"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Guests</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.seats || 1} people
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Total Price</p>
                          <p className="text-sm text-muted-foreground">
                            {/* Assuming backend returns price or we calculate it */}
                            ${booking.totalPrice || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

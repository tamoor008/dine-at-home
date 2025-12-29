"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Edit3,
  Camera,
  Settings,
  History,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Save,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";

import { getMyBookings, getDinnerById } from "@/lib/api";
import { toast } from "sonner";

// Mock data for demonstration (keeping reviews for now as we don't have reviews API yet)
const mockReviews = [
  {
    id: "1",
    dinner: "Authentic Italian Pasta Making",
    host: "Marco Rossi",
    rating: 5,
    comment:
      "Amazing experience! Marco was a fantastic teacher and the pasta was incredible.",
    date: "2024-01-16",
    hostAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
];

function ProfilePageContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  // Use a local loading state for bookings if needed, or rely on auth loading
  const { session } = useAuth(); // Need session for token

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "+1 (555) 123-4567",
    bio: "Food enthusiast and travel lover. Always excited to try new cuisines and meet amazing people!",
    gender: "male",
    country: "United States",
    languages: ["English", "Spanish"],
    profileImage: "",
    memberSince: "January 2023",
  });

  // Fetch real bookings
  useEffect(() => {
    async function fetchBookings() {
      if (!session?.access_token) return;
      setLoadingBookings(true);
      try {
        const data = await getMyBookings(session.access_token);

        // ... (rest of logic same as before, simplified for diff)
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
        setLoadingBookings(false);
      }
    }
    fetchBookings();
  }, [session]);

  // Update profile data when session loads
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        profileImage:
          user.image ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      }));
    }
  }, [user]);

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const url = newTab === "overview" ? "/profile" : `/profile?tab=${newTab}`;
    router.replace(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/auth/signin");
    return null;
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and view your dining history
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={profileData.profileImage}
                        alt={profileData.name}
                      />
                      <AvatarFallback>
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold mb-1">
                    {profileData.name || "Loading..."}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    {profileData.email || "Loading..."}
                  </p>
                  <Badge variant="secondary" className="mb-4">
                    <User className="w-3 h-3 mr-1" />
                    Guest Member
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Member since {profileData.memberSince}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Your profile details and preferences
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        isEditing ? handleSave() : setIsEditing(true)
                      }
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {profileData.name || "Loading..."}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {profileData.email || "Loading..."}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone
                        </label>
                        {isEditing ? (
                          <Input
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {profileData.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Country
                        </label>
                        {isEditing ? (
                          <Input
                            value={profileData.country}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                country: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {profileData.country}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {profileData.bio}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSave}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {bookings.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Bookings
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {
                          bookings.filter(
                            (b) =>
                              b.status === "completed" ||
                              b.status === "confirmed"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confirmed Dinners
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {mockReviews.reduce(
                          (acc, review) => acc + review.rating,
                          0
                        ) / mockReviews.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Rating Given
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Booking History
                    </CardTitle>
                    <CardDescription>
                      Your past and upcoming dinner reservations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingBookings ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No bookings found.
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex gap-4">
                            <div className="relative h-20 w-20 flex-shrink-0">
                              {booking.dinner?.images?.[0] ||
                              booking.dinner?.image ? (
                                <Image
                                  src={
                                    booking.dinner?.images?.[0] ||
                                    booking.dinner?.image
                                  }
                                  alt={booking.dinner?.title || "Dinner"}
                                  fill
                                  className="rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500">
                                    No Image
                                  </span>
                                </div>
                              )}

                              <Badge
                                className={`absolute -top-2 -right-2 text-xs ${getStatusColor(
                                  booking.status || "pending"
                                )}`}
                              >
                                {(booking.status || "pending")
                                  .charAt(0)
                                  .toUpperCase() +
                                  (booking.status || "pending").slice(1)}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">
                                    {booking.dinner?.title ||
                                      "Dinner Reservation"}
                                  </h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <User className="w-4 h-4" />
                                    {booking.dinner?.host?.name || "Host"}
                                  </p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {typeof booking.dinner?.location ===
                                    "object"
                                      ? booking.dinner?.location?.city
                                      : booking.dinner?.location ||
                                        "Location TBD"}
                                  </p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {booking.dinner?.date} at{" "}
                                    {booking.dinner?.time}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-muted-foreground">
                                      {booking.seats || booking.guests} guest
                                      {(booking.seats || booking.guests) > 1
                                        ? "s"
                                        : ""}
                                    </span>
                                    <span className="text-lg font-semibold text-primary-600">
                                      $
                                      {booking.totalPrice ||
                                        booking.totalAmount ||
                                        0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* Review Section (Hidden for now as logic differs) */}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Reviews Given
                    </CardTitle>
                    <CardDescription>
                      Reviews you've written for hosts and dinners
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={review.hostAvatar}
                              alt={review.host}
                            />
                            <AvatarFallback>
                              {review.host.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{review.dinner}</h3>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Host: {review.host}
                            </p>
                            <p className="text-sm mb-2">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {review.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Security
                      </h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Change Password
                        </Button>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Email Verification</p>
                            <p className="text-sm text-muted-foreground">
                              Your email is verified
                            </p>
                          </div>
                          <Badge variant="secondary">Verified</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Phone Verification</p>
                            <p className="text-sm text-muted-foreground">
                              Your phone is verified
                            </p>
                          </div>
                          <Badge variant="secondary">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates via email
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates via SMS
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Disabled
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Methods
                      </h3>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        Manage Payment Methods
                      </Button>
                    </div>

                    <div className="border-t pt-6">
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}

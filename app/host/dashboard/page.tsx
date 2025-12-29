"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { MainLayout } from "@/components/layout/main-layout";
import { HostGuard } from "@/components/auth/host-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  DollarSign,
  Star,
  Plus,
  Edit,
  Eye,
  Clock,
  MapPin,
  ChefHat,
  TrendingUp,
  MessageCircle,
  Settings,
  Home,
  User,
  Heart,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  AlertCircle,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// Mock data for demonstration
const mockDinners = [
  {
    id: "1",
    title: "Authentic Italian Pasta Making",
    date: "2024-02-15",
    time: "19:00",
    guests: 6,
    maxCapacity: 8,
    price: 85,
    status: "upcoming",
    bookings: 6,
    revenue: 510,
    rating: 4.9,
    reviews: 12,
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: "2",
    title: "Japanese Sushi Workshop",
    date: "2024-02-20",
    time: "18:30",
    guests: 4,
    maxCapacity: 6,
    price: 120,
    status: "upcoming",
    bookings: 4,
    revenue: 480,
    rating: 5.0,
    reviews: 8,
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: "3",
    title: "French Wine Tasting",
    date: "2024-01-08",
    time: "20:00",
    guests: 8,
    maxCapacity: 10,
    price: 95,
    status: "completed",
    bookings: 8,
    revenue: 760,
    rating: 4.8,
    reviews: 15,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center",
  },
];

const mockBookings = [
  {
    id: "1",
    dinner: "Authentic Italian Pasta Making",
    guest: {
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face",
      email: "sarah@email.com",
    },
    date: "2024-02-15",
    time: "19:00",
    guests: 2,
    totalAmount: 170,
    status: "confirmed",
    specialRequests: "Vegetarian options please",
  },
  {
    id: "2",
    dinner: "Japanese Sushi Workshop",
    guest: {
      name: "Mike Chen",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      email: "mike@email.com",
    },
    date: "2024-02-20",
    time: "18:30",
    guests: 1,
    totalAmount: 120,
    status: "pending",
    specialRequests: "No raw fish, please",
  },
];

function HostDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { session } = useAuth(); // Destructuring session from useAuth
  const [dinnerFilter, setDinnerFilter] = useState("all");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: "",
    gender: "",
    country: "",
    languages: "",
  });
  const [syncingRole, setSyncingRole] = useState(false);

  const handleSyncRole = async () => {
    if (!session?.access_token || !user?.role) {
      toast.error("Cannot sync role: Missing session or role");
      return;
    }

    setSyncingRole(true);
    try {
      // 1. Explicitly update Supabase User Metadata (Client-side)
      // This ensures the JWT token will have { user_metadata: { role: 'host' } }
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: user.role },
      });

      if (updateError) {
        console.error("Failed to update user metadata:", updateError);
        throw new Error("Failed to update profile metadata");
      }

      // 2. Sync with backend (PATCH /hosts/@me)
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role: user.role }),
      });

      if (response.ok) {
        toast.success("Account permissions synced successfully!");
      } else {
        console.warn("Backend sync warning");
        toast.success("Permissions updated (Backend sync pending)");
      }

      // 3. Refresh session LAST to get a new JWT that hopefully reflects server-side changes
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
    } catch (error) {
      console.error("Sync role error:", error);
      toast.error("An error occurred while syncing.");
    } finally {
      setSyncingRole(false);
    }
  };

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
    const url =
      newTab === "overview"
        ? "/host/dashboard"
        : `/host/dashboard?tab=${newTab}`;
    router.replace(url);
  };

  // Helper function for dinner status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter dinners based on selected filter
  const filteredDinners = mockDinners.filter((dinner) => {
    if (dinnerFilter === "all") return true;
    return dinner.status === dinnerFilter;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">$1,750</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Guests
                </p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">+8 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </p>
                <p className="text-2xl font-bold">4.9</p>
              </div>
              <Star className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">Based on 35 reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Dinners
                </p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-xs text-blue-600 mt-2">Next: Feb 15</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  New booking for Italian Pasta Making
                </p>
                <p className="text-sm text-muted-foreground">
                  Sarah Johnson booked 2 seats for Feb 15
                </p>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New 5-star review received</p>
                <p className="text-sm text-muted-foreground">
                  Mike Chen left a review for Japanese Sushi Workshop
                </p>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Payment received</p>
                <p className="text-sm text-muted-foreground">
                  $480 from French Wine Tasting completed dinner
                </p>
              </div>
              <span className="text-sm text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDinners = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Dinners</h2>
          <p className="text-muted-foreground">
            Manage your dining experiences
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={dinnerFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setDinnerFilter("all")}
        >
          All ({mockDinners.length})
        </Button>
        <Button
          variant={dinnerFilter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setDinnerFilter("upcoming")}
        >
          Upcoming ({mockDinners.filter((d) => d.status === "upcoming").length})
        </Button>
        <Button
          variant={dinnerFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setDinnerFilter("completed")}
        >
          Completed (
          {mockDinners.filter((d) => d.status === "completed").length})
        </Button>
        <Button
          variant={dinnerFilter === "draft" ? "default" : "outline"}
          size="sm"
          onClick={() => setDinnerFilter("draft")}
        >
          Draft ({mockDinners.filter((d) => d.status === "draft").length})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Dinners
                </p>
                <p className="text-2xl font-bold">{mockDinners.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  ${mockDinners.reduce((sum, d) => sum + d.revenue, 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Guests
                </p>
                <p className="text-2xl font-bold">
                  {mockDinners.reduce((sum, d) => sum + d.guests, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </p>
                <p className="text-2xl font-bold">
                  {mockDinners.filter((d) => d.rating > 0).length > 0
                    ? (
                        mockDinners.reduce((sum, d) => sum + d.rating, 0) /
                        mockDinners.filter((d) => d.rating > 0).length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <Star className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dinners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDinners.map((dinner) => (
          <Card key={dinner.id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={dinner.image}
                alt={dinner.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <Badge
                className={`absolute top-3 right-3 ${getStatusColor(
                  dinner.status
                )}`}
              >
                {dinner.status.charAt(0).toUpperCase() + dinner.status.slice(1)}
              </Badge>
            </div>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">{dinner.title}</h3>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {dinner.date} at {dinner.time}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {dinner.guests}/{dinner.maxCapacity} guests
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />${dinner.price} per person
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {dinner.rating > 0
                      ? dinner.rating.toFixed(1)
                      : "No ratings"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({dinner.reviews})
                  </span>
                </div>
                <span className="font-semibold text-primary-600">
                  ${dinner.revenue}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDinners.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No dinners found</h3>
            <p className="text-muted-foreground mb-6">
              {dinnerFilter === "all"
                ? "You haven't created any dinners yet. Create your first dining experience!"
                : `No dinners with status "${dinnerFilter}" found.`}
            </p>
            {dinnerFilter === "all" && (
              <Button
                onClick={() => router.push("/host/dinners/create")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Dinner
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookings</h2>
        <p className="text-muted-foreground">Manage guest reservations</p>
      </div>

      <div className="space-y-4">
        {mockBookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={booking.guest.avatar}
                    alt={booking.guest.name}
                  />
                  <AvatarFallback>
                    {booking.guest.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{booking.guest.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.guest.email}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      {booking.dinner}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {booking.date} at {booking.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />${booking.totalAmount}
                    </div>
                    {booking.specialRequests && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <strong>Special Requests:</strong>{" "}
                        {booking.specialRequests}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Security</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Change Password</p>
                  </div>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <RefreshCw
                    className={`w-5 h-5 text-blue-600 ${
                      syncingRole ? "animate-spin" : ""
                    }`}
                  />
                  <div>
                    <p className="font-medium">Sync Account Permissions</p>
                    <p className="text-sm text-muted-foreground">
                      Fix issues with "Forbidden" errors
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleSyncRole}
                  disabled={syncingRole}
                >
                  {syncingRole ? "Syncing..." : "Sync Permissions"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Verification</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Verification</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via SMS
                    </p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Payment Methods</h3>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Manage Payment Methods</p>
                </div>
              </div>
              <Button variant="outline">Manage Payment Methods</Button>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="pt-6 border-t">
            <Button variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reviews</h2>
        <p className="text-muted-foreground">
          Manage and respond to guest reviews
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">4.8</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on 24 reviews
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                      alt="John Doe profile"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">John Doe</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "Amazing experience! The host was fantastic and the food was
                delicious."
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Japanese Sushi Workshop • 2 days ago
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face"
                      alt="Sarah Miller profile"
                    />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Sarah Miller</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "Perfect evening! Great conversation and wonderful food."
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Italian Family Dinner • 1 week ago
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
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
                      alt={profileData.name || "Host profile"}
                    />
                    <AvatarFallback>
                      {profileData.name
                        ? profileData.name.charAt(0).toUpperCase()
                        : "H"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-xl font-semibold mb-1">
                  {profileData.name || "Loading..."}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {profileData.email || "Loading..."}
                </p>
                <Badge variant="secondary" className="mb-4">
                  <ChefHat className="w-3 h-3 mr-1" />
                  Host Member
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Member since January 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
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
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {profileData.name || "Loading..."}
                  </p>
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
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profileData.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profileData.country || "Not specified"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <p className="text-sm text-muted-foreground">
                  {profileData.bio || "No bio provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages ? (
                    profileData.languages.split(",").map((lang, index) => (
                      <Badge key={index} variant="secondary">
                        {lang.trim()}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">English</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">12</div>
                <div className="text-sm text-muted-foreground">
                  Total Dinners
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">48</div>
                <div className="text-sm text-muted-foreground">
                  Guests Hosted
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">4.8</div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HostGuard>
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Host Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your dining experiences and bookings
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/")}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <Button
                  onClick={() => router.push("/host/dinners/create")}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Dinner
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dinners">My Dinners</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="dinners" className="mt-6">
              {renderDinners()}
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              {renderBookings()}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {renderReviews()}
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              {renderProfile()}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              {renderSettings()}
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </HostGuard>
  );
}

export default function HostDashboardPage() {
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
      <HostDashboardContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChefHat, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function RoleSelectionPage() {
  const { user, session, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🎭 RoleSelectionPage Mounted");
    console.log("Current User:", user);
    console.log("Is Authenticated:", isAuthenticated);
    console.log("Auth Loading:", authLoading);

    if (!authLoading && !isAuthenticated) {
      console.log("redirecting to signin because not authenticated");
      router.push("/auth/signin");
    }

    if (user?.role === "host") {
      console.log("User is already host, redirecting to dashboard");
      router.push("/host/dashboard");
    }
    // Removed auto-redirect for 'guest' to allow them to upgrade to 'host' on this page
  }, [user, isAuthenticated, authLoading, router]);

  const handleRoleSelection = async (role: "guest" | "host") => {
    setLoading(true);

    try {
      if (!session?.access_token) {
        throw new Error("No access token available");
      }

      // 1. Explicitly update Supabase User Metadata (Client-side)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role },
      });

      if (updateError) {
        throw new Error(
          `Failed to update profile metadata: ${updateError.message}`
        );
      }

      // 2. Sync with backend
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        toast.success(`Role updated to ${role}`);
      } else {
        console.error("Failed to update role API");
        toast.error("Failed to sync role with backend");
      }

      // 3. Refresh session LAST to capture any backend changes
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn(
          "Session refresh failed during role selection",
          refreshError
        );
      }

      window.location.href = role === "host" ? "/host/dashboard" : "/";
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("An error occurred while updating role");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome to DineWithUs!
            </h1>
            <p className="text-lg text-muted-foreground">
              Please choose how you'd like to use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guest Option */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">I'm a Guest</CardTitle>
                <CardDescription>
                  I want to discover and book amazing dining experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• Browse unique dining experiences</li>
                  <li>• Book meals with local hosts</li>
                  <li>• Leave reviews and ratings</li>
                  <li>• Save favorite experiences</li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleRoleSelection("guest")}
                  disabled={loading}
                >
                  Continue as Guest
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Host Option */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">I'm a Host</CardTitle>
                <CardDescription>
                  I want to share my culinary skills and earn money
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• Create dining experiences</li>
                  <li>• Host guests in your home</li>
                  <li>• Earn money from bookings</li>
                  <li>• Build your culinary reputation</li>
                </ul>
                <Button
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  onClick={() => handleRoleSelection("host")}
                  disabled={loading}
                >
                  Continue as Host
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Don't worry, you can always change your role later in your account
              settings.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

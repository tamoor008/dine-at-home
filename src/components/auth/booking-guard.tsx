"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  canBookDinners,
  getAccessDeniedMessage,
  getRoleBasedRedirect,
} from "../../lib/access-control";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface BookingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function BookingGuard({ children, fallback }: BookingGuardProps) {
  const { session, user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    // Need to type cast session/user to match what access-control expects
    // access-control likely expects NextAuth Session.
    // We should probably update access-control.ts too, but for now we can adapt.
    const mockSession = session
      ? { user: { ...user, role: user?.role } }
      : null;

    if (mockSession && !canBookDinners(mockSession as any)) {
      const redirectUrl = getRoleBasedRedirect(mockSession as any);
      router.push(redirectUrl);
    }
  }, [isAuthenticated, loading, session, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const mockSession = session ? { user: { ...user, role: user?.role } } : null;

  if (mockSession && !canBookDinners(mockSession as any)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {getAccessDeniedMessage(mockSession as any)}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button
              onClick={() =>
                router.push(getRoleBasedRedirect(mockSession as any))
              }
              variant="outline"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && mockSession && canBookDinners(mockSession as any)) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

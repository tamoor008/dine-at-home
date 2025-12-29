"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  canAccessHostDashboard,
  getAccessDeniedMessageForHostDashboard,
} from "@/lib/access-control";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth-context";

interface HostGuardProps {
  children: React.ReactNode;
}

export function HostGuard({ children }: HostGuardProps) {
  const { session, user, loading } = useAuth();
  const router = useRouter();

  const mockSession = session ? { user: { ...user, role: user?.role } } : null;

  const isAllowed = canAccessHostDashboard(mockSession);
  const accessDeniedMessage =
    getAccessDeniedMessageForHostDashboard(mockSession);

  useEffect(() => {
    if (loading) return; // Do nothing while session is loading

    if (!isAllowed) {
      // Optionally, you could redirect immediately here
      // But showing a message first is more user-friendly
    }
  }, [loading, isAllowed, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Alert className="max-w-md w-full p-6 rounded-lg shadow-lg">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <AlertDescription className="mt-4 text-center text-lg font-medium">
            {accessDeniedMessage}
          </AlertDescription>
          <div className="mt-6 text-center">
            <Button onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

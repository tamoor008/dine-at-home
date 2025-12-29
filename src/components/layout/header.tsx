"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Menu,
  User,
  Calendar,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ChefHat,
} from "lucide-react";
import { SearchParams } from "@/types";

interface HeaderProps {
  onSearch?: (params: SearchParams) => void;
}

export function Header({ onSearch }: HeaderProps = {}) {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="hidden sm:block font-bold text-xl text-primary">
                DineWithUs
              </span>
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 border border-border rounded-full px-2 py-1 hover:shadow-card transition-shadow"
                >
                  <Menu className="w-4 h-4" />
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || "User avatar"}
                    />
                    <AvatarFallback>
                      {user?.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenuItem className="font-semibold">
                      {user.name || user.email}
                    </DropdownMenuItem>
                    {user.role === "host" ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => router.push("/host/dashboard")}
                        >
                          <ChefHat className="w-4 h-4 mr-2" />
                          Host Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/host/dashboard?tab=dinners")
                          }
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          My Dinners
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/host/dashboard?tab=bookings")
                          }
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/host/dashboard?tab=reviews")
                          }
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Reviews
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => router.push("/profile")}
                        >
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push("/profile?tab=bookings")}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          My bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push("/profile?tab=reviews")}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          My reviews
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/help-center")}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help Center
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          user.role === "host"
                            ? "/host/dashboard?tab=settings"
                            : "/profile?tab=settings"
                        )
                      }
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      className="font-semibold"
                      onClick={() => router.push("/auth/signup")}
                    >
                      Sign up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/auth/signin")}
                    >
                      Log in
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/help-center")}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help Center
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

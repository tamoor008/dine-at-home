import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata = {
  title: "DineWithUs",
  description: "Find your next authentic dining experience",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

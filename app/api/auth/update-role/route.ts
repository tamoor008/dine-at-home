import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();

    if (!role || !["guest", "host"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user role in local database
    const updatedUser = await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        role: role,
        needsRoleSelection: false,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split("@")[0],
        role: role,
        needsRoleSelection: false,
      },
    });

    // Sync with External Backend
    const API_Base = process.env.NEXT_PUBLIC_API_URL;
    if (API_Base) {
      try {
        // 1. Standard Role Update
        const externalResponse = await fetch(`${API_Base}/auth/update-role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        });

        if (!externalResponse.ok) {
          console.error(
            `[Proxy] External backend update-role failed: Status ${externalResponse.status}`,
            await externalResponse.text()
          );
        } else {
          console.log(
            `[Proxy] External backend update-role success: Status ${externalResponse.status}`
          );
        }

        // 2. Initialize Host Profile (Critical for new hosts)
        if (role === "host") {
          try {
            console.log(
              "[Proxy] Attempting to initialize host profile via PATCH /hosts/@me"
            );
            const hostResponse = await fetch(`${API_Base}/hosts/@me`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ bio: "I am a new host on DineWithUs!" }),
            });

            if (!hostResponse.ok) {
              console.error(
                `[Proxy] Failed to initialize host profile: Status ${hostResponse.status}`,
                await hostResponse.text()
              );
            } else {
              console.log("[Proxy] Host profile initialized successfully");
            }
          } catch (hostErr) {
            console.error("[Proxy] Error calling /hosts/@me:", hostErr);
          }
        }
      } catch (err) {
        console.error("[Proxy] Failed to call external backend:", err);
      }
    } else {
      console.warn(
        "[Proxy] API_Base not configured, skipping backend role update"
      );
    }

    return NextResponse.json({
      success: true,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

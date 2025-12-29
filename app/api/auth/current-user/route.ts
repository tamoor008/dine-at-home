import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
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
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !authUser || !authUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user from database, or create if missing (Sync Supabase -> Prisma)
    let user = await prisma.user.findUnique({
      where: {
        email: authUser.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        needsRoleSelection: true,
      },
    });

    if (!user) {
      console.log(
        `[CurrentUser] User ${authUser.email} not found in DB. Creating...`
      );
      console.log(
        `[CurrentUser] Default metadata role: ${authUser.user_metadata?.role}`
      );

      // Create new user in Prisma
      user = await prisma.user.create({
        data: {
          id: authUser.id, // Synced ID from Supabase
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split("@")[0],
          role: authUser.user_metadata?.role || "guest", // Default to guest if not specified
          needsRoleSelection: !authUser.user_metadata?.role, // If no role, needs selection
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          needsRoleSelection: true,
        },
      });
      console.log(`[CurrentUser] Created new user:`, user);
    } else {
      console.log(`[CurrentUser] Found existing user:`, user);
    }

    return NextResponse.json({
      user: user,
      session: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        needsRoleSelection: user.needsRoleSelection,
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

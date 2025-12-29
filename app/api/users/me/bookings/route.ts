import { NextRequest, NextResponse } from "next/server";

const API_Base = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  try {
    if (!API_Base) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${API_Base}/users/@me/bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        // Return empty list if 404 (optional, depending on backend behavior)
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { message: `Backend error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

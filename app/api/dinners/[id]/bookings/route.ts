import { NextRequest, NextResponse } from "next/server";

const API_Base = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!API_Base) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const externalResponse = await fetch(`${API_Base}/dinners/${id}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = await externalResponse.json();

    if (!externalResponse.ok) {
      console.error("[Proxy] Booking Error:", {
        status: externalResponse.status,
        message: data.message,
      });
      return NextResponse.json(
        { message: data.message || "Failed to create booking" },
        { status: externalResponse.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

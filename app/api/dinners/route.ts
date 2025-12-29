import { NextRequest, NextResponse } from "next/server";

const API_Base = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    if (!API_Base) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const externalResponse = await fetch(`${API_Base}/dinners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = await externalResponse.json();

    if (!externalResponse.ok) {
      // Diagnostic: Check what the backend thinks of this user
      if (externalResponse.status === 403) {
        try {
          // Check Host Profile
          const hostResponse = await fetch(`${API_Base}/hosts/@me`, {
            headers: { Authorization: token },
          });
          const hostData = await hostResponse.text();
          console.error(
            `[Proxy] Diagnostic - Backend Host Profile (Status ${hostResponse.status}):`,
            hostData
          );

          // Check User Role
          const userResponse = await fetch(`${API_Base}/users/@me`, {
            headers: { Authorization: token },
          });
          const userData = await userResponse.text();
          console.error(
            `[Proxy] Diagnostic - Backend User State (Status ${userResponse.status}):`,
            userData
          );
        } catch (diagError) {
          console.error("[Proxy] Diagnostic check failed:", diagError);
        }
      }

      console.error("[Proxy] Backend Error:", {
        status: externalResponse.status,
        message: data.message,
        data: JSON.stringify(data),
      });
      return NextResponse.json(
        { message: data.message || "Failed to create dinner" },
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

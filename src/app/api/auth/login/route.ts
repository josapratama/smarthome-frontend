import { NextResponse } from "next/server";
import { authUpstream } from "@/lib/api/server/auth-upstream";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.username || !body?.password) {
      return NextResponse.json(
        { message: "username dan password wajib" },
        { status: 400 },
      );
    }

    const { res, payload } = await authUpstream.login(
      String(body.username),
      String(body.password),
    );

    console.log("Login response status:", res.status);
    console.log("Login response payload:", payload);

    if (!res.ok) {
      return NextResponse.json(payload ?? { message: "Login gagal" }, {
        status: res.status,
      });
    }

    // Type guard: at this point we know it's a successful response
    if (!payload || !("data" in payload)) {
      console.error("Invalid payload structure:", payload);
      return NextResponse.json(
        { message: "Backend response tidak valid" },
        { status: 502 },
      );
    }

    const data = payload.data;
    if (!data?.accessToken) {
      console.error("Missing accessToken in data:", data);
      return NextResponse.json(
        { message: "Backend tidak mengirim accessToken" },
        { status: 502 },
      );
    }

    const resp = NextResponse.json(
      {
        data: {
          user: data.user,
          // Return redirect path based on role
          redirectTo:
            data.user.role === "ADMIN" ? "/dashboard" : "/user/dashboard",
        },
      },
      { status: 200 },
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set access token
    resp.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set refresh token if provided
    if (data.refreshToken) {
      resp.cookies.set("refresh_token", data.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Set session ID
    resp.cookies.set("admin_session_id", String(data.sessionId), {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    // Store user role in cookie for middleware
    resp.cookies.set("user_role", data.user.role, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    return resp;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 },
    );
  }
}

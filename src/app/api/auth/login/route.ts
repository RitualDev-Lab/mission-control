import { ALLOWED_ADMIN_USER, SESSION_COOKIE_NAME, verifyGitHubIdentity } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body?.token?.trim();

    if (!token) {
      return NextResponse.json({ error: "Missing admin token or GitHub PAT." }, { status: 400 });
    }

    const session = await verifyGitHubIdentity(token);

    if (!session || session.user.toLowerCase() !== ALLOWED_ADMIN_USER.toLowerCase()) {
      return NextResponse.json(
        { error: `Unauthorized. Access restricted strictly to RitualDev administrator (${ALLOWED_ADMIN_USER}).` },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, Buffer.from(JSON.stringify(session)).toString("base64"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Authentication failed." }, { status: 500 });
  }
}

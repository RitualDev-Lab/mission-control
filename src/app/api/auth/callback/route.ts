import { ALLOWED_ADMIN_USER, SESSION_COOKIE_NAME, verifyGitHubIdentity } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = new URL(request.url).origin;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || "Authorization cancelled")}`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=Missing_OAuth_Credentials`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "RitualDev-Mission-Control",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(`${baseUrl}/login?error=Token_Exchange_Failed`);
    }

    // Verify identity is strictly 'divyanshujethi'
    const session = await verifyGitHubIdentity(accessToken);
    if (!session || session.user.toLowerCase() !== ALLOWED_ADMIN_USER.toLowerCase()) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=Access_Denied_User_Not_Authorized_Only_${ALLOWED_ADMIN_USER}_Permitted`
      );
    }

    session.method = "oauth";

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, Buffer.from(JSON.stringify(session)).toString("base64"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.redirect(`${baseUrl}/`);
  } catch (err: any) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(err.message || "OAuth Exception")}`);
  }
}

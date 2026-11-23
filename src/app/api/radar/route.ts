import { getAdminSession } from "@/lib/auth";
import { fetchFullMissionControlData } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please authenticate." }, { status: 401 });
  }

  try {
    const data = await fetchFullMissionControlData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch telemetry radar." }, { status: 500 });
  }
}

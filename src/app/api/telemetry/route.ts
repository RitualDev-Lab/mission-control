import { getAdminSession } from "@/lib/auth";
import { getTelemetryLogs, recordTelemetryLog } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ logs: getTelemetryLogs() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.command || !body.errorName) {
      return NextResponse.json({ error: "Invalid telemetry payload" }, { status: 400 });
    }

    recordTelemetryLog({
      command: body.command,
      errorName: body.errorName,
      message: body.message || "Unknown error",
      os: body.os || "unknown",
      arch: body.arch || "unknown",
      polyVersion: body.polyVersion || "0.6.1",
      runtimeVersion: body.runtimeVersion || "unknown",
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

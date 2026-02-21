import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: { service: string } }
) {
  return NextResponse.json(
    { error: `Webhook ${params.service} not implemented` },
    { status: 501 }
  );
}

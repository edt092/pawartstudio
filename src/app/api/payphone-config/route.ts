import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.PAYPHONE_TOKEN;
  const storeId = process.env.PAYPHONE_STORE_ID;

  if (!token || !storeId) {
    return NextResponse.json(
      { error: "PayPhone no configurado" },
      { status: 500 }
    );
  }

  return NextResponse.json({ token, storeId });
}

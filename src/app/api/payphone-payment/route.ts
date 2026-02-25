import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, whatsapp, address, clientTransactionId, amount } = body;

    if (!fullName || !email || !whatsapp || !address || !clientTransactionId || !amount) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const token = process.env.PAYPHONE_TOKEN;
    const storeId = process.env.PAYPHONE_STORE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pawartstudio.netlify.app";

    if (!token || !storeId) {
      console.error("PayPhone credentials not configured");
      return NextResponse.json(
        { error: "Error de configuración del pago" },
        { status: 500 }
      );
    }

    // PayPhone trabaja en centavos USD
    const amountInCents = Math.round(amount * 100);

    const payphoneRes = await fetch(
      "https://pay.payphonetodoesposible.com/api/button/Prepare",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountInCents,
          amountWithTax: 0,
          amountWithoutTax: amountInCents,
          tax: 0,
          service: 0,
          tip: 0,
          currency: "USD",
          storeId,
          reference: `PAWS-${clientTransactionId}`,
          clientTransactionId,
          responseUrl: baseUrl,
          cancellationUrl: baseUrl,
        }),
      }
    );

    if (!payphoneRes.ok) {
      const errText = await payphoneRes.text();
      console.error("PayPhone Prepare error:", payphoneRes.status, errText);
      return NextResponse.json(
        { error: `Error PayPhone (${payphoneRes.status}): ${errText}` },
        { status: 500 }
      );
    }

    const payphoneData = await payphoneRes.json();
    const paymentUrl = payphoneData.payWithCard || payphoneData.payWithPayPhone;

    if (!paymentUrl) {
      console.error("PayPhone returned no payment URL:", payphoneData);
      return NextResponse.json(
        { error: `PayPhone no retornó URL de pago: ${JSON.stringify(payphoneData)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error("PayPhone payment route error:", error);
    return NextResponse.json(
      { error: "Error generando enlace de pago" },
      { status: 500 }
    );
  }
}

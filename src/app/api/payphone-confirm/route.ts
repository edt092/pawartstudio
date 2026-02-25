import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, clientTransactionId, orderData } = body;

    if (!id || !clientTransactionId) {
      return NextResponse.json(
        { error: "Parámetros de transacción inválidos" },
        { status: 400 }
      );
    }

    const token = process.env.PAYPHONE_TOKEN;
    if (!token) {
      console.error("PayPhone token not configured");
      return NextResponse.json(
        { error: "Error de configuración del pago" },
        { status: 500 }
      );
    }

    const confirmRes = await fetch(
      "https://pay.payphonetodoesposible.com/api/button/V2/Confirm",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, clientTransactionId }),
      }
    );

    if (!confirmRes.ok) {
      const errText = await confirmRes.text();
      console.error("PayPhone Confirm error:", errText);
      return NextResponse.json(
        { error: "Error confirmando transacción con PayPhone" },
        { status: 500 }
      );
    }

    const confirmData = await confirmRes.json();

    if (confirmData.transactionStatus !== "Approved") {
      return NextResponse.json(
        {
          error: "El pago no fue aprobado",
          transactionStatus: confirmData.transactionStatus,
        },
        { status: 400 }
      );
    }

    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      ...(orderData ?? {}),
      payment: {
        provider: "payphone",
        payphoneId: id,
        clientTransactionId,
        transactionStatus: confirmData.transactionStatus,
        amount: confirmData.amount,
      },
      status: "paid",
      createdAt: new Date().toISOString(),
    };

    console.log("New PayPhone order received:", order);

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("PayPhone confirm route error:", error);
    return NextResponse.json(
      { error: "Error confirmando el pago" },
      { status: 500 }
    );
  }
}

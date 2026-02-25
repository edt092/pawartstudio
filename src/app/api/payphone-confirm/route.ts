import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, sendTelegramPhoto } from "@/lib/telegram";

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

    // Notificación a Telegram
    try {
      const amountUSD = (confirmData.amount / 100).toFixed(2);
      const caption =
        `💰 <b>PAGO CONFIRMADO — PayPhone</b>\n\n` +
        `📋 <b>Pedido:</b> ${orderId}\n` +
        `👤 <b>Cliente:</b> ${orderData?.fullName ?? "—"}\n` +
        `📧 ${orderData?.email ?? "—"}\n` +
        `📱 ${orderData?.whatsapp ?? "—"}\n` +
        `📍 ${orderData?.address ?? "—"}\n\n` +
        `👕 <b>Talla:</b> ${orderData?.tshirtSize ?? "—"} | <b>Color:</b> ${orderData?.tshirtColor ?? "—"}\n` +
        `💵 <b>Total pagado:</b> $${amountUSD} USD\n` +
        `🚚 <b>Envío:</b> $${orderData?.shippingCost?.toFixed(2) ?? "—"} USD\n\n` +
        `🔖 <b>ID transacción:</b> <code>${clientTransactionId}</code>`;

      if (orderData?.variantImage) {
        await sendTelegramPhoto(orderData.variantImage, caption);
      } else {
        await sendTelegramMessage(caption);
      }
    } catch (tgErr) {
      console.error("Telegram notification error:", tgErr);
      // No fallar el pedido si Telegram falla
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("PayPhone confirm route error:", error);
    return NextResponse.json(
      { error: "Error confirmando el pago" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, sendTelegramPhoto } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      whatsapp,
      address,
      tshirtSize,
      tshirtColor,
      shippingCost,
      subtotal,
      variantImage,
    } = body;

    const caption =
      `🏦 <b>SOLICITUD DE TRANSFERENCIA BANCARIA</b>\n\n` +
      `👤 <b>Cliente:</b> ${fullName ?? "—"}\n` +
      `📧 ${email ?? "—"}\n` +
      `📱 ${whatsapp ?? "—"}\n` +
      `📍 ${address ?? "—"}\n\n` +
      `👕 <b>Talla:</b> ${tshirtSize ?? "—"} | <b>Color:</b> ${tshirtColor ?? "—"}\n` +
      `💵 <b>Total:</b> $${subtotal ?? "—"} USD\n` +
      `🚚 <b>Envío:</b> $${shippingCost ?? "—"} USD\n\n` +
      `⚠️ <b>Pendiente confirmación de pago</b>`;

    if (variantImage) {
      await sendTelegramPhoto(variantImage, caption);
    } else {
      await sendTelegramMessage(caption);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transfer request notification error:", error);
    // Devolver éxito igual para no bloquear al cliente
    return NextResponse.json({ success: true });
  }
}

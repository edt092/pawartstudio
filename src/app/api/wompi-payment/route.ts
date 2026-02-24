import { NextRequest, NextResponse } from "next/server";

// Precio del producto en centavos de COP (89.900 COP = 8.990.000 centavos)
// ⚠️ Cambia este valor según tu precio real de venta
const PRICE_IN_CENTS = 8990000;
const CURRENCY = "COP";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, whatsapp, address } = body;

    if (!fullName || !email || !whatsapp || !address) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

    if (!integritySecret || !publicKey) {
      console.error("Wompi credentials not configured");
      return NextResponse.json(
        { error: "Error de configuración del pago" },
        { status: 500 }
      );
    }

    // Referencia única por transacción
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `PAWS-${timestamp}-${random}`;

    // Generación de firma de integridad en el servidor
    // Formato: SHA-256( reference + amountInCents + currency + integritySecret )
    const concatenated = `${reference}${PRICE_IN_CENTS}${CURRENCY}${integritySecret}`;
    const encoded = new TextEncoder().encode(concatenated);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return NextResponse.json({
      reference,
      amountInCents: PRICE_IN_CENTS,
      currency: CURRENCY,
      publicKey,
      signature,
    });
  } catch (error) {
    console.error("Wompi payment session error:", error);
    return NextResponse.json(
      { error: "Error generando sesión de pago" },
      { status: 500 }
    );
  }
}

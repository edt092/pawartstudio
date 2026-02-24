import { NextRequest, NextResponse } from "next/server";

const CURRENCY = "COP";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, whatsapp, address, totalCOP } = body;

    if (!fullName || !email || !whatsapp || !address) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!totalCOP || typeof totalCOP !== "number" || totalCOP < 1000) {
      return NextResponse.json(
        { error: "Monto inválido" },
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

    // Wompi requiere el monto en centavos (COP × 100)
    const amountInCents = Math.round(totalCOP) * 100;

    // Referencia única por transacción
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `PAWS-${timestamp}-${random}`;

    // Generación de firma de integridad en el servidor
    // Formato: SHA-256( reference + amountInCents + currency + integritySecret )
    const concatenated = `${reference}${amountInCents}${CURRENCY}${integritySecret}`;
    const encoded = new TextEncoder().encode(concatenated);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return NextResponse.json({
      reference,
      amountInCents,
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

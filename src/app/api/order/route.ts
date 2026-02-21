import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, whatsapp, address, selectedVariant, tshirtColor, tshirtSize } = body;

    if (!fullName || !email || !whatsapp || !address) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const order = {
      id: crypto.randomUUID(),
      fullName,
      email,
      whatsapp,
      address,
      selectedVariant,
      tshirtColor,
      tshirtSize,
      status: "pending_contact",
      createdAt: new Date().toISOString(),
    };

    console.log("New order received:", order);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Pedido recibido correctamente",
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { error: "Error procesando el pedido" },
      { status: 500 }
    );
  }
}

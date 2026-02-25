# PawArtStudio

Tienda online para camisetas personalizadas con arte generado por IA a partir de fotos de mascotas. Los clientes suben una foto de su mascota, generan variantes de arte con IA, eligen diseño, talla y color, y pagan directamente en el sitio.

## Características

- Generación de arte con IA (Google Gemini) a partir de fotos de mascotas
- Vista previa 3D de la camiseta con el diseño seleccionado
- Cálculo de envío estimado por geolocalización
- Pagos para **Ecuador** con PayPhone (Cajita de Pagos — widget embebido)
- Pagos para **Colombia** con Wompi
- Opción de transferencia bancaria (Ecuador) y Nequi (Colombia)
- Notificaciones automáticas por Telegram al confirmar cada pedido
- Detección automática de país por IP

## Stack

- **Framework:** Next.js 15 (App Router)
- **Despliegue:** Netlify
- **IA:** Google Gemini API
- **Pagos EC:** PayPhone (Cajita de Pagos)
- **Pagos CO:** Wompi
- **Notificaciones:** Telegram Bot API

## Variables de entorno

Crea un archivo `.env.local` con:

```env
# IA
PawArtStudioKey=...

# Wompi (Colombia)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=...
WOMPI_INTEGRITY_SECRET=...

# PayPhone (Ecuador)
PAYPHONE_TOKEN=...
PAYPHONE_STORE_ID=...

# Telegram (notificaciones de pedidos)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# General
NEXT_PUBLIC_BASE_URL=https://tudominio.com
```

## Flujo de pago Ecuador (PayPhone)

1. Cliente llena formulario → click "Ir a pagar con PayPhone"
2. Se inicializa el widget `PPaymentButtonBox` directamente en la página
3. Cliente paga → PayPhone redirige de vuelta con `?id=&clientTransactionId=`
4. El sitio confirma la transacción en `/api/payphone-confirm`
5. Se envía notificación a Telegram con foto del diseño y datos del pedido

## Flujo transferencia bancaria

1. Cliente llena formulario → click "Solicitar datos por WhatsApp"
2. Se envía notificación a Telegram (pedido pendiente de pago)
3. WhatsApp se abre con mensaje prellenado con los datos del pedido

## APIs internas

| Endpoint | Descripción |
|---|---|
| `POST /api/generate` | Genera arte con Gemini |
| `GET /api/payphone-config` | Devuelve token/storeId de PayPhone al cliente |
| `POST /api/payphone-confirm` | Confirma transacción PayPhone y notifica Telegram |
| `POST /api/transfer-request` | Registra solicitud de transferencia y notifica Telegram |
| `POST /api/wompi-payment` | Crea referencia de pago Wompi |

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para simular Ecuador usa `?country=EC` en la URL, para Colombia `?country=CO`.

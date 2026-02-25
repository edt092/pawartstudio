const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendTelegramMessage(text: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados");
  }

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Telegram sendMessage error ${res.status}: ${errText}`);
  }
}

export async function sendTelegramPhoto(
  base64Image: string,
  caption: string
): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados");
  }

  try {
    const base64Data = base64Image.includes(",")
      ? base64Image.split(",")[1]
      : base64Image;
    const mimeType = base64Image.startsWith("data:")
      ? base64Image.split(";")[0].split(":")[1]
      : "image/jpeg";
    const ext = mimeType.split("/")[1] || "jpg";

    const buffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
    formData.append(
      "photo",
      new Blob([buffer], { type: mimeType }),
      `design.${ext}`
    );

    const res = await fetch(`${TELEGRAM_API}/sendPhoto`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Telegram sendPhoto error ${res.status}: ${errText}`);
    }
  } catch (photoErr) {
    // Si falla la foto, enviar solo el texto como fallback
    console.error("sendPhoto falló, enviando solo texto:", photoErr);
    await sendTelegramMessage(caption + "\n\n⚠️ <i>(imagen no disponible)</i>");
  }
}

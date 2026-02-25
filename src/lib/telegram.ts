const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function sendTelegramMessage(text: string): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function sendTelegramPhoto(
  base64Image: string,
  caption: string
): Promise<void> {
  // Extraer el buffer del base64 (puede venir como data:image/...;base64,XXXX o solo XXXX)
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

  await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: "POST",
    body: formData,
  });
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawArt Studio - Tu mascota en una obra de arte",
  description:
    "Convierte a tu mascota en una obra de arte con IA y recíbelo en una camiseta personalizada de alta calidad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-light text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

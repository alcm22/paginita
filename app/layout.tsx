import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paginita",
  description: "Tu espacio para estar cerca.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

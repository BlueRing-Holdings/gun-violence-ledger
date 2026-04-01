import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gladius — No Guidance Civic Ledger Suite",
  description:
    "A permanent record of firearm deaths worldwide. Data sourced from WHO, CDC WONDER, UCDP, and Gun Violence Archive.",
  icons: {
    icon: "/brand/gladius-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

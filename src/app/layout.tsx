import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dooit",
  description: "Date-based todo app with recurring daily and one-time tasks",
  icons: {
    icon: "/favico.png",
    shortcut: "/favico.png",
    apple: "/favico.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

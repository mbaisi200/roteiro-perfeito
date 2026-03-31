import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoteiroPerfeito - Gerador Inteligente de Roteiros de Viagem",
  description:
    "Crie roteiros de viagem personalizados com inteligência artificial. Planeje sua próxima viagem de forma inteligente com sugestões de passeios, restaurantes e dicas práticas.",
  keywords: [
    "roteiro de viagem",
    "planejamento de viagem",
    "IA para viagens",
    "gerador de roteiro",
    "dicas de viagem",
    "viagem personalizada",
  ],
  authors: [{ name: "RoteiroPerfeito" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "RoteiroPerfeito - Gerador Inteligente de Roteiros de Viagem",
    description:
      "Crie roteiros de viagem personalizados com inteligência artificial.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

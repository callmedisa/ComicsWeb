import type { Metadata } from "next";
import { Baloo_2, Nunito, Bangers } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});
const bangers = Bangers({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bangers",
});

export const metadata: Metadata = {
  title: "ComicSpeak AI",
  description: "Learn English by speaking your own AI-generated comics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${baloo.variable} ${nunito.variable} ${bangers.variable} font-body`}
      >
        {children}
      </body>
    </html>
  );
}

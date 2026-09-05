import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DebateAI — AI Debate Coach & Study Partner Chatbot",
  description: "An interactive AI chatbot that acts as your personal debate coach and study partner. Practice debate motions, receive counterarguments, detect fallacies, and sharpen critical thinking with optional voice sparring.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased flex flex-col selection:bg-blue-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium tracking-wide text-slate-400">
              DebateAI &bull; <span className="text-blue-400 font-semibold">AI Debate Coach & Study Partner Chatbot</span>
            </p>
            <p className="text-slate-500">
              Interactive debate practice chatbot with real-time argument analysis, fallacy detection & optional voice mode.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

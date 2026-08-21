"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrentPageProvider } from "./contexts/PageContext";
import { TodayScheduleProvider } from "./contexts/TodayScheduleContext";
import { TomorrowScheduleProvider } from "./contexts/TomorrowScheduleContext";
import { UpcomingScheduleProvider } from "./contexts/UpcomingScheduleContext";
import { LoginProvider } from "./contexts/LoginContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LoginProvider>
          <UpcomingScheduleProvider>
            <TomorrowScheduleProvider>
              <TodayScheduleProvider>
                <CurrentPageProvider>{children}</CurrentPageProvider>
              </TodayScheduleProvider>
            </TomorrowScheduleProvider>
          </UpcomingScheduleProvider>
        </LoginProvider>
      </body>
    </html>
  );
}

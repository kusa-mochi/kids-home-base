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

type Provider = React.ComponentType<{ children: React.ReactNode }>;

type ComposeProvidersProps = {
  providers: Provider[];
  children: React.ReactNode;
}

function ComposeProviders(ps: ComposeProvidersProps) {
  return ps.providers.reduceRight((acc, ProviderComponent) => {
    return <ProviderComponent>{acc}</ProviderComponent>;
  }, ps.children);
}

const providers: Provider[] = [
  LoginProvider,
  UpcomingScheduleProvider,
  TomorrowScheduleProvider,
  TodayScheduleProvider,
  CurrentPageProvider,
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ width: '100%', height: '100%' }}>
        <ComposeProviders providers={providers}>
          {children}
        </ComposeProviders>
      </body>
    </html>
  );
}

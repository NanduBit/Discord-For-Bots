"use client";

import AuthCheck from "../components/AuthCheck";
import { DiscordProvider } from "../context/DiscordContext";
import MainLayout from "../components/MainLayout";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthCheck>
      <DiscordProvider>
        <MainLayout>
          {children}
        </MainLayout>
      </DiscordProvider>
    </AuthCheck>
  );
}

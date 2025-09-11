"use client";

import AuthCheck from "../components/AuthCheck";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthCheck>{children}</AuthCheck>;
}

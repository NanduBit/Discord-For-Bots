"use client"; // Need client directive for localStorage access
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists, if so redirect to app
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/app");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600 opacity-30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="text-center space-y-6 px-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Discord for Bots <span className="text-purple-400">by Nandu</span>
        </h1>

        <Link href="/app">
          <button className="px-8 py-3 text-lg font-semibold rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 transition-transform shadow-lg">
            Go to App
          </button>
        </Link>
        
        <div className="mt-4">
          <Link href="/login" className="text-purple-400 hover:text-purple-300 underline">
            Login with Bot Token
          </Link>
        </div>
      </div>
    </main>
  );
}

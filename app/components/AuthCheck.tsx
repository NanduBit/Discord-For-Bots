"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      // Redirect to login if no token found
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [router]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-100">Loading...</div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}

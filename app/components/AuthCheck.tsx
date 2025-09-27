"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage silently in the background
    // without affecting the UI or showing any loading indicators
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.log("No authentication token found, redirecting to login");
          router.replace("/login");
          return;
        }
        
        // Optional: Silently verify the token validity with Discord API
        // This could be added later without disrupting the UI
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/login");
      }
    };
    
    // Run the authentication check
    checkAuth();
  }, [router]);

  // Immediately render children without waiting for auth check
  // The redirection will happen in the background if needed
  return <>{children}</>;
}

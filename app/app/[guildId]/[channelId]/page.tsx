"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatArea from '../../../components/ChatArea';

// This component only renders the ChatArea since the rest is in MainLayout
export default function Discord() {
  const router = useRouter();

  // Use this effect to help with better navigation transitions
  useEffect(() => {
    // Mark page as fully loaded to prevent flashing between transitions
    const handleRouteComplete = () => {
      console.log('Route change complete - channel page fully loaded');
      document.body.classList.remove('loading');
    };
    
    // Handle initial load
    handleRouteComplete();
    
    return () => {
      console.log('Channel page unmounting');
    };
  }, []);

  return <ChatArea />;
}

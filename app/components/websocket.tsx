"use client";

import { useEffect } from "react";

export default function DiscordListener() {
  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000; // Start with 1 second
    let seq: number | null = null;
    let heartbeatInterval: any;
    let ws: WebSocket;

    // Function to handle new messages
    const handleNewMessage = (messageData: any) => {
      
      // Dispatch a custom event that other components can listen for
      const event = new CustomEvent("discord-message", { 
        detail: messageData 
      });
      window.dispatchEvent(event);
      
      // Update UI or trigger notifications for new messages
      // For example, play a sound for notifications if it's a direct mention
      const isMention = messageData.mentions?.some(
        (mention: any) => mention.id === messageData.author.id
      );
      
      if (isMention) {
        // Could play a notification sound here
      }
    };
    
    // Function to connect to Discord gateway
    const connectWebSocket = () => {
      // Get token from local storage
      const token = localStorage.getItem("token");
      
      // Don't connect if no token is available
      if (!token) {
        console.warn("Discord WebSocket: No token found in local storage");
        return;
      }
      
      const gateway = "wss://gateway.discord.gg/?v=10&encoding=json";
      ws = new WebSocket(gateway);
      
      // Reset heartbeat interval if reconnecting
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const { t, s, op, d } = payload;

        if (s) seq = s;

        switch (op) {
          case 10: {
            const { heartbeat_interval } = d;
            heartbeatInterval = setInterval(() => {
              ws.send(JSON.stringify({ op: 1, d: seq }));
            }, heartbeat_interval);

            // Use token from local storage for authentication
            ws.send(JSON.stringify({
              op: 2,
              d: {
                token: token,
                intents: 33281,
                properties: {
                  "$os": "browser",
                  "$browser": "nextjs-client",
                  "$device": "nextjs-client"
                }
              }
            }));
            break;
          }
        }

        if (t === "MESSAGE_CREATE") {
          // Handle new message events
          handleNewMessage(d);
        }
      };

      ws.onopen = () => {
        console.log("Discord WebSocket connected");
        // Reset reconnect attempts counter on successful connection
        reconnectAttempts = 0;
      };

      ws.onclose = (event) => {
        console.log(`Discord WebSocket closed: ${event.code} ${event.reason}`);
        clearInterval(heartbeatInterval);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
          console.log(`Attempting to reconnect in ${delay/1000} seconds...`);
          
          setTimeout(() => {
            reconnectAttempts++;
            connectWebSocket();
          }, delay);
        } else {
          console.error(`Failed to reconnect after ${maxReconnectAttempts} attempts`);
        }
      };

      ws.onerror = (error) => {
        console.error("Discord WebSocket error:", error);
      };
    };
    
    // Start the initial connection
    connectWebSocket();

    return () => {
      clearInterval(heartbeatInterval);
      if (ws && ws.readyState < 2) { // 0 = CONNECTING, 1 = OPEN
        ws.close();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}

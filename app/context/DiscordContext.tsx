"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Define types for the context data
interface Server {
  id: string;
  name: string;
  iconUrl: string;
}

interface Channel {
  id: string;
  name: string;
  type: number;
  topic?: string | null;
  position: number;
  parent_id?: string | null;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rtc_region?: string | null;
  permission_overwrites?: any[];
}

interface CategoryGroup {
  category: {
    id: string | null;
    name: string;
  };
  text_channels: Channel[];
  voice_channels: Channel[];
}

interface DiscordContextType {
  servers: Server[];
  activeServerId: string;
  serverName: string;
  channels: CategoryGroup[];
  loading: {
    servers: boolean;
    channels: boolean;
  };
  error: {
    servers: string;
    channels: string;
  };
  refreshChannels: () => void;
}

// Create the context
const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

// Provider component
export function DiscordProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Use localStorage directly to keep track of whether we've already fetched servers
  // This prevents the servers from being fetched again on client-side navigation
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);
  
  const [servers, setServers] = useState<Server[]>([]);
  const [activeServerId, setActiveServerId] = useState<string>("");
  const [serverName, setServerName] = useState<string>("Discord for Bots");
  const [channels, setChannels] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState({
    servers: false,
    channels: false
  });
  const [error, setError] = useState({
    servers: "",
    channels: ""
  });

  // Fetch servers when the component mounts - but only once regardless of navigation
  useEffect(() => {
    // Skip fetching if we've already done it
    if (initialFetchDone && servers.length > 0) {
      console.log("Servers already fetched, skipping API call");
      return;
    }
    
    const fetchServers = async () => {
      try {
        setLoading(prev => ({ ...prev, servers: true }));
        
        // Only run this in the browser
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("token");
          
          // Fetch servers with retry logic for rate limits
          console.log("Fetching servers from API");
          const response = await fetch("/api/guilds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            cache: 'no-store', // Ensure we get fresh data
          });
          
          if (!response.ok) {
            // Handle rate limiting specially
            if (response.status === 429) {
              const data = await response.json();
              const retryAfter = data.retryAfter ? parseInt(data.retryAfter) * 1000 : 5000;
              
              console.log(`Rate limited by Discord API. Retrying in ${retryAfter/1000} seconds...`);
              
              // Set a timer to retry after the specified delay
              setTimeout(fetchServers, retryAfter);
              return;
            }
            
            console.error(`Error fetching servers: ${response.status}`);
            setError(prev => ({ ...prev, servers: `Failed to load servers: ${response.statusText}` }));
            setServers([]);
            return;
          }
          
          const data = await response.json();
          
          // Make sure data is an array before setting it
          if (Array.isArray(data)) {
            console.log("Successfully fetched servers:", data.length);
            setServers(data);
            setError(prev => ({ ...prev, servers: "" }));
            setInitialFetchDone(true); // Mark as fetched
          } else if (data && data.error) {
            console.error(`API error: ${data.error}`);
            setError(prev => ({ ...prev, servers: `API error: ${data.error}` }));
            setServers([]);
          } else {
            console.error('Unexpected API response format');
            setError(prev => ({ ...prev, servers: 'Unexpected API response format' }));
            setServers([]);
          }
        }
      } catch (e: any) {
        console.error("Error fetching servers:", e);
        setError(prev => ({ ...prev, servers: `Error: ${e.message}` }));
        setServers([]);
      } finally {
        setLoading(prev => ({ ...prev, servers: false }));
      }
    };
    
    fetchServers();
    
    // Extract server ID from URL to determine active server
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/\/app\/([^\/]+)/);
      if (match && match[1]) {
        setActiveServerId(match[1]);
      }
    }
  }, [initialFetchDone, servers.length]);

  // Track the previous pathname to compare against the current one
  const [prevPathname, setPrevPathname] = useState<string>("");
  
  // Update active server ID when URL changes (using Next.js pathname)
  useEffect(() => {
    // Extract server ID from pathname
    const extractServerIdFromPath = (path: string) => {
      const match = path.match(/\/app\/([^\/]+)/);
      return match && match[1] ? match[1] : "";
    };
    
    // Extract channel ID from pathname
    const extractChannelIdFromPath = (path: string) => {
      const match = path.match(/\/app\/[^\/]+\/([^\/]+)/);
      return match && match[1] ? match[1] : "";
    };
    
    const newServerId = extractServerIdFromPath(pathname);
    const prevServerId = extractServerIdFromPath(prevPathname);
    
    // Only consider this a server change if the server ID has actually changed
    const isServerChange = newServerId !== prevServerId && newServerId !== "";
    
    // Check if we're just changing channels within the same server
    const isChannelChangeOnly = 
      newServerId === prevServerId && 
      newServerId !== "" &&
      extractChannelIdFromPath(pathname) !== extractChannelIdFromPath(prevPathname);
    
    // Only log meaningful transitions
    if (isServerChange) {
      console.log(`Server changed: ${prevServerId} -> ${newServerId}`);
      
      // Clear channels immediately when switching servers
      setChannels([]);
    } else if (isChannelChangeOnly) {
      console.log(`Channel changed within server ${newServerId}`);
      // Don't clear channels when just switching between channels in the same server
    }
    
    // Update the active server ID if it changed
    if (newServerId !== activeServerId) {
      setActiveServerId(newServerId);
    }
    
    // Store the current pathname for the next comparison
    setPrevPathname(pathname);
  }, [pathname, activeServerId, prevPathname]);

  // Keep track of which servers we've already fetched channels for
  const [fetchedChannelsForServers, setFetchedChannelsForServers] = useState<Set<string>>(new Set());
  
  // Fetch channels when active server ID changes
  useEffect(() => {
    // Skip if no active server or we're not in a browser environment
    if (!activeServerId || typeof window === 'undefined') {
      // Reset channels when no server is selected
      setChannels([]);
      setServerName("Discord for Bots");
      return;
    }
    
    // If we've already fetched channels for this server and they're still in state, don't fetch again
    if (fetchedChannelsForServers.has(activeServerId) && channels.length > 0) {
      console.log(`Already fetched channels for server ${activeServerId}, using cached data`);
      return;
    }
    
    const fetchGuildChannels = async () => {
      try {
        // Set loading state but don't clear channels immediately to prevent flicker
        setLoading(prev => ({ ...prev, channels: true }));
        
        const token = localStorage.getItem("token") || "";
        console.log(`Fetching channels for guild ID: ${activeServerId}`);
        
        // Use POST with token in the request body for security
        const response = await fetch(`/api/guilds/${activeServerId}/channels`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-Debug-Info": "DiscordContext-Component" 
          },
          body: JSON.stringify({ token }),
          // Add cache control to ensure fresh data
          cache: 'no-store',
        });
        
        if (!response.ok) {
          console.error(`Error fetching guild channels: ${response.status} ${response.statusText}`);
          // Try to get more error details
          try {
            const errorData = await response.json();
            console.error("Error details:", errorData);
            setError(prev => ({ ...prev, channels: `Failed to load channels: ${errorData.error || response.statusText}` }));
          } catch (e) {
            console.error("Couldn't parse error response");
            setError(prev => ({ ...prev, channels: `Failed to load channels: ${response.statusText}` }));
          }
          return;
        }
        
        const channelsData = await response.json();
        
        // Set the channel data directly in the expected format
        if (Array.isArray(channelsData) && channelsData.length > 0) {
          console.log(`Successfully fetched ${channelsData.length} channel groups for ${activeServerId}`);
          setChannels(channelsData);
          setError(prev => ({ ...prev, channels: "" }));
          
          // Remember that we've fetched channels for this server
          setFetchedChannelsForServers(prev => new Set(prev).add(activeServerId));
        } else {
          setError(prev => ({ ...prev, channels: "Invalid channel data format" }));
        }
        
        // Also fetch guild info to get server name
        const guildResponse = await fetch(`/api/guilds/${activeServerId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          cache: 'no-store',
        });
        
        if (guildResponse.ok) {
          const guildData = await guildResponse.json();
          if (guildData && guildData.name) {
            setServerName(guildData.name);
          }
        }
        
      } catch (error: any) {
        console.error("Error fetching guild channels:", error);
        setError(prev => ({ ...prev, channels: `Failed to load channels: ${error.message || "Unknown error"}` }));
      } finally {
        setLoading(prev => ({ ...prev, channels: false }));
      }
    };
    
    fetchGuildChannels();
    
  }, [activeServerId, fetchedChannelsForServers, channels.length]);

  const refreshChannels = () => {
    if (activeServerId) {
      // Clear channels immediately
      setChannels([]);
      setError(prev => ({ ...prev, channels: "" }));
      setLoading(prev => ({ ...prev, channels: true }));
      
      const token = localStorage.getItem("token") || "";
      fetch(`/api/guilds/${activeServerId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: 'no-store',
      })
        .then(res => {
          if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setChannels(data);
          } else {
            throw new Error("Invalid channel data format");
          }
          setLoading(prev => ({ ...prev, channels: false }));
        })
        .catch(err => {
          setError(prev => ({ ...prev, channels: `Failed to load channels: ${err.message}` }));
          setLoading(prev => ({ ...prev, channels: false }));
        });
    }
  };

  // Context value
  const value = {
    servers,
    activeServerId,
    serverName,
    channels,
    loading,
    error,
    refreshChannels
  };

  return (
    <DiscordContext.Provider value={value}>
      {children}
    </DiscordContext.Provider>
  );
}

// Custom hook to use the context
export const useDiscordContext = () => {
  const context = useContext(DiscordContext);
  if (context === undefined) {
    throw new Error('useDiscordContext must be used within a DiscordProvider');
  }
  return context;
};
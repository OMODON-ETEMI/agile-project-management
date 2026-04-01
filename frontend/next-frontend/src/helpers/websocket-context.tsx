"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from 'socket.io-client';
import { useAuth } from "../Authentication/authcontext";
import { NotificationToast } from "../features/notifications/notification-toast";
import { Notification } from "./type";


interface webContextSocketProvider{
  socket: Socket | undefined,
  realtimeNotification? : Notification | null,
  setRealtimeNotification: (notification: Notification) => void,  
}

const WebSocketContext = createContext<webContextSocketProvider | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState<Notification | null>(null);
  // We use a ref to persist the socket instance without triggering re-renders
  const socketRef = useRef<Socket>();
  
  // Use http:// for Socket.io initialization
  const WS_URL = "http://localhost:4000"; 

  const { currentUser } = useAuth();
  useEffect(() => {
    // 1. Initialize the socket only once on mount
    const socket = io(WS_URL, { 
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {

      if(currentUser?.user_id){
        socket.emit("user:join", currentUser.user_id);
      }
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    // 2. Cleanup on unmount
    return () => {
      socket.off("notification:new");
      socket.disconnect();
    };
  }, [currentUser]); 

  return (
    <WebSocketContext.Provider value={{realtimeNotification, socket:socketRef.current, setRealtimeNotification }}>
      {/* 3. Optional: Add a visual indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 right-0 p-1 text-[10px] opacity-50">
          Socket: {isConnected ? "🟢" : "🔴"}
        </div>
      )}
        <NotificationToast
          notification={realtimeNotification}
          onDismiss={() => setRealtimeNotification(null)}
        />
          {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
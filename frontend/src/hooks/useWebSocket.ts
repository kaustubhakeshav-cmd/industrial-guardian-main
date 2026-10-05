import { useEffect, useState, useRef } from 'react';

export default function useWebSocket(url: string) {
  const [data, setData] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Connect to WebSocket
    socketRef.current = new WebSocket(url);

    // 2. Handle Incoming Messages
    socketRef.current.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      
      // Update state: Add new data point, keep only the last 20 points for performance
      setData((prevData) => {
        const updatedData = [...prevData, newData];
        if (updatedData.length > 20) {
          return updatedData.slice(updatedData.length - 20);
        }
        return updatedData;
      });
    };

    // 3. Handle Connection Open
    socketRef.current.onopen = () => {
      console.log("✅ WebSocket Connected");
    };

    // 4. Handle Errors & Reconnect
    socketRef.current.onclose = () => {
      console.log("⚠️ WebSocket Disconnected. Reconnecting in 3s...");
      setTimeout(() => {
        // Trigger re-connect by reloading the effect (simplified for now)
        window.location.reload(); 
      }, 3000);
    };

    // 5. Cleanup on Unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url]);

  return data;
}
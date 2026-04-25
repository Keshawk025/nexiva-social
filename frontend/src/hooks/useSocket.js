import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function useSocket(token) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const nextSocket = io(SOCKET_URL, {
      auth: { token }
    });

    setSocket(nextSocket);
    return () => nextSocket.disconnect();
  }, [token]);

  return socket;
}

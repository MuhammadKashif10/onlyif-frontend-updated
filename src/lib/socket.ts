import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (!socket) {
    // Ensure we connect to the backend host, not the /api path
    const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const base = raw.replace(/\/api$/, "");

    socket = io(base, {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

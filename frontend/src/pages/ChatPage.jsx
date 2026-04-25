import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { ChatPanel } from "../components/ChatPanel";

export function ChatPage() {
  const { user } = useAuth();
  const token = localStorage.getItem("nexiva_token");
  const socket = useSocket(token);

  return (
    <div className="stack">
      <section className="hero-banner compact">
        <div>
          <span className="eyebrow">Messaging</span>
          <h1>Real-time direct messages with Socket.io.</h1>
        </div>
      </section>
      <ChatPanel socket={socket} currentUser={user} />
    </div>
  );
}

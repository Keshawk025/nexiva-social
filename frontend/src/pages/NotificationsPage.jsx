import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useSocket } from "../hooks/useSocket";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("nexiva_token");
  const socket = useSocket(token);

  useEffect(() => {
    api.get("/notifications").then((data) => setNotifications(data.notifications));
  }, []);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleNotification = (notification) => {
      setNotifications((current) => [notification, ...current]);
    };

    socket.on("notification:new", handleNotification);
    return () => socket.off("notification:new", handleNotification);
  }, [socket]);

  async function handleMarkRead() {
    await api.patch("/notifications/read-all");
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }

  return (
    <div className="stack">
      <section className="panel notifications-header">
        <div>
          <span className="eyebrow">Notifications</span>
          <h1>Likes, comments, and messages.</h1>
        </div>
        <button onClick={handleMarkRead}>Mark all read</button>
      </section>
      {notifications.map((item) => (
        <article key={item._id} className={`panel notification-item ${item.isRead ? "read" : ""}`}>
          <strong>{item.actor?.name || "Someone"}</strong>
          <p>{item.message}</p>
          <time>{new Date(item.createdAt).toLocaleString()}</time>
        </article>
      ))}
    </div>
  );
}

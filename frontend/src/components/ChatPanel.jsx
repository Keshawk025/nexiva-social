import { useEffect, useState } from "react";
import { api } from "../api/client";

export function ChatPanel({ socket, currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    api.get("/chat/conversations").then((data) => setConversations(data.conversations));
  }, []);

  useEffect(() => {
    if (!socket || !selectedConversation) {
      return undefined;
    }

    socket.emit("chat:join", selectedConversation._id);
    const handleMessage = (message) => {
      if (message.conversation === selectedConversation._id || message.conversation?._id === selectedConversation._id) {
        setMessages((current) => [...current, message]);
      }
    };

    socket.on("chat:message", handleMessage);
    return () => socket.off("chat:message", handleMessage);
  }, [socket, selectedConversation]);

  async function openConversation(conversation) {
    setSelectedConversation(conversation);
    const data = await api.get(`/chat/conversations/${conversation._id}/messages`);
    setMessages(data.messages);
  }

  async function handleSearchUsers(query) {
    setSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const data = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    setSearchResults(data.users.filter((user) => user._id !== currentUser._id));
  }

  async function handleStartConversation(participantId) {
    const data = await api.post("/chat/conversations", { participantId });
    const existing = conversations.find((item) => item._id === data.conversation._id);
    const nextConversations = existing
      ? conversations
      : [data.conversation, ...conversations];

    setConversations(nextConversations);
    setSearch("");
    setSearchResults([]);
    openConversation(data.conversation);
  }

  function participantLabel(conversation) {
    return conversation.participants.find((item) => item._id !== currentUser._id) || currentUser;
  }

  function handleSend(event) {
    event.preventDefault();
    if (!socket || !selectedConversation || !content.trim()) {
      return;
    }

    socket.emit("chat:send", {
      conversationId: selectedConversation._id,
      content
    });
    setContent("");
  }

  return (
    <div className="chat-layout">
      <section className="panel chat-sidebar">
        <input
          placeholder="Search users to message"
          value={search}
          onChange={(event) => handleSearchUsers(event.target.value)}
        />
        {searchResults.length ? (
          <div className="search-results">
            {searchResults.map((user) => (
              <button key={user._id} className="search-user" onClick={() => handleStartConversation(user._id)}>
                <strong>{user.name}</strong>
                <span>@{user.username}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="conversation-list">
          {conversations.map((conversation) => {
            const participant = participantLabel(conversation);
            return (
              <button
                key={conversation._id}
                className={`conversation-item ${selectedConversation?._id === conversation._id ? "active" : ""}`}
                onClick={() => openConversation(conversation)}
              >
                <strong>{participant.name}</strong>
                <span>@{participant.username}</span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="panel chat-main">
        {selectedConversation ? (
          <>
            <div className="message-list">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message-bubble ${
                    message.sender._id === currentUser._id ? "mine" : ""
                  }`}
                >
                  <strong>{message.sender.name}</strong>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
            <form className="message-form" onSubmit={handleSend}>
              <input
                placeholder="Type a message"
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <button>Send</button>
            </form>
          </>
        ) : (
          <div className="empty-state">Select a conversation or start a new one.</div>
        )}
      </section>
    </div>
  );
}

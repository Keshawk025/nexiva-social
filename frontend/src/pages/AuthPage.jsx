import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="hero-copy">
          <span className="eyebrow">Social Platform MVP</span>
          <h1>Profiles, feed, chat, and notifications in one place.</h1>
          <p>
            Nexiva is structured as a mobile-friendly social network starter with real-time messaging and media posts.
          </p>
        </div>
        <form className="panel auth-form" onSubmit={handleSubmit}>
          <div className="auth-toggle">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
              Register
            </button>
          </div>
          {mode === "register" ? (
            <>
              <input
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <input
                placeholder="Username"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
              />
            </>
          ) : null}
          <input
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <button disabled={submitting}>{submitting ? "Working..." : mode === "login" ? "Login" : "Create account"}</button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}

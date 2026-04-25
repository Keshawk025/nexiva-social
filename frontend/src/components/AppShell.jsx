import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAssetUrl, getInitials } from "../utils/assets";

export function AppShell() {
  const { user, logout } = useAuth();
  const avatarUrl = getAssetUrl(user?.avatarUrl);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link to="/" className="brand">
            <span className="brand-mark">N</span>
            <span className="brand-copy">
              <strong>Nexiva</strong>
              <small>social operating layer</small>
            </span>
          </Link>
          <p className="sidebar-note">Track the feed, conversations, and profile updates from one focused workspace.</p>
        </div>
        <nav className="nav">
          <NavLink to="/">Feed</NavLink>
          <NavLink to="/chat">Chat</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
          <NavLink to={`/profile/${user?.username || ""}`}>Profile</NavLink>
        </nav>
        <div className="profile-chip">
          <div className="avatar-shell small">
            {avatarUrl ? <img src={avatarUrl} alt={user?.name || "Profile"} /> : <span>{getInitials(user?.name)}</span>}
          </div>
          <div>
            <strong>{user?.name}</strong>
            <span>@{user?.username}</span>
          </div>
          <button onClick={logout} className="ghost-button">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

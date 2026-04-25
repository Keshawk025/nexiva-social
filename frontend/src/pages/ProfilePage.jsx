import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getAssetUrl, getInitials } from "../utils/assets";

export function ProfilePage() {
  const { username } = useParams();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", bio: "", avatarUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api
      .get(`/users/${username}`)
      .then((data) => {
        setProfile(data.user);
        setForm({
          name: data.user.name,
          bio: data.user.bio || "",
          avatarUrl: data.user.avatarUrl || ""
        });
      })
      .catch((err) => setError(err.message));
  }, [username]);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = await api.put("/users/me", form);
      setProfile(data.user);
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingAvatar(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const upload = await api.post("/uploads/image", formData);
      setForm((current) => ({ ...current, avatarUrl: upload.imageUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  if (!profile) {
    return <div className="panel">{error ? error : "Loading profile..."}</div>;
  }

  const isSelf = user?.username === profile.username;
  const avatarUrl = getAssetUrl(form.avatarUrl || profile.avatarUrl);

  return (
    <div className="stack">
      <section className="panel profile-header">
        <div className="avatar-shell profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt={profile.name} /> : <span>{getInitials(profile.name)}</span>}
        </div>
        <div className="profile-summary">
          <span className="eyebrow">Profile</span>
          <h1>{profile.name}</h1>
          <p>@{profile.username}</p>
          <p>{profile.bio || "No bio yet."}</p>
        </div>
      </section>
      {isSelf ? (
        <form className="panel profile-form" onSubmit={handleSave}>
          <div className="form-head">
            <div>
              <span className="eyebrow">Edit profile</span>
              <h2>Shape how people see you</h2>
            </div>
            <label className="file-input">
              <span>{uploadingAvatar ? "Uploading..." : "Upload avatar"}</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input
            placeholder="Avatar URL"
            value={form.avatarUrl}
            onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })}
          />
          <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={4} />
          <button disabled={saving || uploadingAvatar}>{saving ? "Saving..." : "Save profile"}</button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : null}
    </div>
  );
}

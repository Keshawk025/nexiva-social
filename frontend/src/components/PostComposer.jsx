import { useState } from "react";
import { api } from "../api/client";

export function PostComposer({ onCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const upload = await api.post("/uploads/image", formData);
        imageUrl = upload.imageUrl;
      }

      const data = await api.post("/posts", { content, imageUrl });
      setContent("");
      setImage(null);
      onCreated(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel composer" onSubmit={handleSubmit}>
      <div className="composer-head">
        <div>
          <span className="eyebrow">New post</span>
          <h2>Drop a quick update</h2>
        </div>
        <span className={`composer-count ${content.length > 440 ? "warn" : ""}`}>{content.length}/500</span>
      </div>
      <textarea
        placeholder="Share what is happening"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
      />
      {image ? <div className="composer-preview">Selected image: {image.name}</div> : null}
      <div className="composer-actions">
        <label className="file-input">
          <span>{image ? image.name : "Attach image"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
          />
        </label>
        <button disabled={submitting || !content.trim()}>{submitting ? "Posting..." : "Post"}</button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </form>
  );
}

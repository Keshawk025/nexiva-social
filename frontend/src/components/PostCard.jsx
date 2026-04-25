import { useState } from "react";
import { api } from "../api/client";
import { getAssetUrl, getInitials } from "../utils/assets";

export function PostCard({ post, onChange }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const avatarUrl = getAssetUrl(post.author.avatarUrl);

  async function handleLike() {
    const data = await api.post(`/posts/${post._id}/like`, {});
    onChange(data.post);
  }

  async function handleComment(event) {
    event.preventDefault();
    if (!comment.trim()) {
      return;
    }

    setSubmitting(true);
    const data = await api.post(`/posts/${post._id}/comments`, { content: comment });
    setComment("");
    onChange(data.post);
    setSubmitting(false);
  }

  return (
    <article className="panel post-card">
      <header className="post-header">
        <div className="post-author">
          <div className="avatar-shell">
            {avatarUrl ? <img src={avatarUrl} alt={post.author.name} /> : <span>{getInitials(post.author.name)}</span>}
          </div>
          <div>
            <strong>{post.author.name}</strong>
            <span>@{post.author.username}</span>
          </div>
        </div>
        <time>{new Date(post.createdAt).toLocaleString()}</time>
      </header>
      <p className="post-copy">{post.content}</p>
      {post.imageUrl ? (
        <img className="post-image" src={getAssetUrl(post.imageUrl)} alt="Post attachment" />
      ) : null}
      <div className="post-meta">
        <button onClick={handleLike}>Like ({post.likes.length})</button>
        <span>{post.comments.length} comments</span>
      </div>
      <form className="comment-form" onSubmit={handleComment}>
        <input
          placeholder="Write a comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <button disabled={submitting}>{submitting ? "Sending..." : "Reply"}</button>
      </form>
      <div className="comment-list">
        {post.comments.map((item) => (
          <div key={item._id} className="comment-item">
            <strong>{item.author.name}</strong>
            <span>{item.content}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

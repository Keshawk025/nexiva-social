import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PostComposer } from "../components/PostComposer";
import { PostCard } from "../components/PostCard";

export function FeedPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/posts").then((data) => setPosts(data.posts));
  }, []);

  function handleCreated(post) {
    setPosts((current) => [post, ...current]);
  }

  function handleChanged(updatedPost) {
    setPosts((current) => current.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  }

  return (
    <div className="stack">
      <section className="hero-banner hero-grid">
        <div className="hero-copy-block">
          <span className="eyebrow">Timeline</span>
          <h1>Community updates with a sharper editorial rhythm.</h1>
          <p>Publish image-led posts, follow the pulse of the feed, and keep the main activity surface readable at a glance.</p>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{posts.length}</strong>
            <span>posts in view</span>
          </div>
          <div>
            <strong>{posts.reduce((count, post) => count + post.comments.length, 0)}</strong>
            <span>comments</span>
          </div>
          <div>
            <strong>{posts.reduce((count, post) => count + post.likes.length, 0)}</strong>
            <span>reactions</span>
          </div>
        </div>
      </section>
      <PostComposer onCreated={handleCreated} />
      {posts.length ? (
        posts.map((post) => <PostCard key={post._id} post={post} onChange={handleChanged} />)
      ) : (
        <section className="panel empty-panel">
          <span className="eyebrow">Feed</span>
          <h2>No posts yet</h2>
          <p>Be the first person to publish something visual, useful, or worth reacting to.</p>
        </section>
      )}
    </div>
  );
}

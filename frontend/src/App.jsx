
import { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("access")
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [message, setMessage] = useState("");

  // LOGIN
  async function login(e) {
    e.preventDefault();

    try {
      const res = await api.post("auth/login/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      setToken(res.data.access);
      setMessage("");
    } catch {
      setMessage("Invalid username or password.");
    }
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setToken(null);
    setUsername("");
    setPassword("");
    setPosts([]);
    setComments([]);
    setMessage("");
  }

  // LOAD POSTS, COMMENTS, AND CURRENT USER
  async function loadData() {
    try {
      const [postRes, commentRes, userRes] = await Promise.all([
        api.get("posts/"),
        api.get("comments/"),
        api.get("auth/me/"),
      ]);

      setPosts(
        Array.isArray(postRes.data)
          ? postRes.data
          : postRes.data.results || []
      );

      setComments(
        Array.isArray(commentRes.data)
          ? commentRes.data
          : commentRes.data.results || []
      );

      setUsername(userRes.data.username);
      setMessage("");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setToken(null);
        setMessage("Session expired. Please log in again.");
      } else {
        setMessage("Could not load data. Check your API endpoints.");
      }
    }
  }

  // LOAD DATA AFTER LOGIN
// LOAD DATA AFTER LOGIN
useEffect(() => {
  if (token) {
    const fetchData = async () => {
      await loadData();
    };

    fetchData();
  }
}, [token]);

  // CREATE OR UPDATE POST
  async function savePost(e) {
    e.preventDefault();

    try {
      if (editingId !== null) {
        await api.patch(`posts/${editingId}/`, {
          title,
          content,
        });
      } else {
        await api.post("posts/", {
          title,
          content,
        });
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      setMessage("");

      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Unable to save post."
      );
    }
  }

  // EDIT POST
  function editPost(post) {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
  }

  // DELETE POST
  async function deletePost(id) {
    if (!window.confirm("Delete this post?")) {
      return;
    }

    try {
      await api.delete(`posts/${id}/`);
      await loadData();
    } catch {
      setMessage("Unable to delete post.");
    }
  }

  // ADD COMMENT
  async function addComment(postId) {
    try {
      await api.post("comments/", {
        post: postId,
        content: commentText[postId],
      });

      setCommentText((old) => ({
        ...old,
        [postId]: "",
      }));

      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Unable to add comment."
      );
    }
  }

  // EDIT COMMENT
  async function editComment(comment) {
    const updatedContent = window.prompt(
      "Edit your comment:",
      comment.content
    );

    if (updatedContent === null) {
      return;
    }

    try {
      await api.patch(`comments/${comment.id}/`, {
        content: updatedContent,
      });

      await loadData();
    } catch {
      setMessage("Unable to edit comment.");
    }
  }

  // DELETE COMMENT
  async function deleteComment(id) {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    try {
      await api.delete(`comments/${id}/`);
      await loadData();
    } catch {
      setMessage("Unable to delete comment.");
    }
  }

  // LOGIN PAGE
  if (!token) {
    return (
      <main className="container">
        <h1>Blog Management System</h1>
        <h2>Login</h2>

        <form onSubmit={login}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>{message}</p>
      </main>
    );
  }

  // MAIN BLOG PAGE
  return (
    <main className="container">
      <header className="header">
        <h1>Blog Management System</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <p>{message}</p>

      <h2>{editingId !== null ? "Edit Post" : "Create Blog Post"}</h2>

      <form onSubmit={savePost}>
        <input
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Write your blog..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button type="submit">
          {editingId !== null ? "Update Post" : "Publish Post"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setContent("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h2>All Blog Posts</h2>

      {posts.map((post) => (
        <article className="post" key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>

          <small>
            By {post.author} ·{" "}
            {post.created_at
              ? new Date(post.created_at).toLocaleString()
              : ""}
          </small>

          {post.author === username && (
            <div className="actions">
              <button onClick={() => editPost(post)}>
                Edit
              </button>

              <button onClick={() => deletePost(post.id)}>
                Delete
              </button>
            </div>
          )}

          <h4>Comments</h4>

          {comments
            .filter((comment) => comment.post === post.id)
            .map((comment) => (
              <div className="comment" key={comment.id}>
                <p>
                  <strong>{comment.author}:</strong>{" "}
                  {comment.content}
                </p>

                {comment.author === username && (
                  <>
                    <button onClick={() => editComment(comment)}>
                      Edit
                    </button>

                    <button
                      onClick={() => deleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addComment(post.id);
            }}
          >
            <input
              placeholder="Write a comment..."
              value={commentText[post.id] || ""}
              onChange={(e) =>
                setCommentText((old) => ({
                  ...old,
                  [post.id]: e.target.value,
                }))
              }
              required
            />

            <button type="submit">Add Comment</button>
          </form>
        </article>
      ))}
    </main>
  );
}

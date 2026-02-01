import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";

function ViewSync() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sync, setSync] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSync();
  }, [id]);

  async function fetchSync() {
    try {
      const response = await fetch(`/api/syncs/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Sync not found");
        }
        throw new Error("Failed to fetch sync");
      }
      const data = await response.json();
      setSync(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete Sync #${String(id).padStart(3, "0")}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/syncs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sync");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading sync...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😕</div>
        <h2>{error}</h2>
        <p>The sync you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="sync-view">
      <div className="sync-view-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ←
        </button>
        <span className="sync-card-number">
          #{String(sync.id).padStart(3, "0")}
        </span>
        <div className="sync-view-actions">
          <Link to={`/edit/${sync.id}`} className="btn btn-secondary">
            ✏️ Edit
          </Link>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "🗑️ Delete"}
          </button>
        </div>
      </div>
      <MarkdownRenderer content={sync.content} />
    </div>
  );
}

export default ViewSync;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchSync();
    } else {
      fetchTemplate();
    }
  }, [id]);

  async function fetchSync() {
    try {
      const response = await fetch(`/api/syncs/${id}`);
      if (!response.ok) throw new Error("Failed to fetch sync");
      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTemplate() {
    try {
      const response = await fetch("/api/template");
      if (!response.ok) throw new Error("Failed to fetch template");
      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      // Fallback if template doesn't exist
      setContent(
        "# Week {NUMBER} - AI News Sync\n**Date**: {DATE}\n\n## 🔥 Highlights\n\n- \n",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const url = isEditing ? `/api/syncs/${id}` : "/api/syncs";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to save sync");

      const data = await response.json();
      navigate(`/sync/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (isEditing) {
      navigate(`/sync/${id}`);
    } else {
      navigate("/");
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1 className="page-title">
          {isEditing
            ? `Edit Sync #${String(id).padStart(3, "0")}`
            : "Create New Sync"}
        </h1>
        <div className="editor-actions">
          <button
            className="btn btn-ghost"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "var(--danger)",
            color: "#fff",
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-md)",
          }}
        >
          {error}
        </div>
      )}

      <div className="editor-split">
        <div className="editor-pane">
          <div className="editor-pane-header">Markdown</div>
          <textarea
            className="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your sync content here..."
          />
        </div>
        <div className="editor-pane">
          <div className="editor-pane-header">Preview</div>
          <div className="editor-preview">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;

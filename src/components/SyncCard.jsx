import { Link } from "react-router-dom";

function SyncCard({ sync }) {
  return (
    <Link to={`/sync/${sync.id}`} className="sync-card">
      <div className="sync-card-header">
        <span className="sync-card-number">
          #{String(sync.id).padStart(3, "0")}
        </span>
        {sync.date && <span className="sync-card-date">{sync.date}</span>}
      </div>
      <h3 className="sync-card-title">{sync.title}</h3>
      {sync.preview && <p className="sync-card-preview">{sync.preview}</p>}
    </Link>
  );
}

export default SyncCard;

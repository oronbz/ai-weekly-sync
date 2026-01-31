import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SyncCard from '../components/SyncCard'

function Home() {
    const [syncs, setSyncs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchSyncs()
    }, [])

    async function fetchSyncs() {
        try {
            const response = await fetch('/api/syncs')
            if (!response.ok) throw new Error('Failed to fetch syncs')
            const data = await response.json()
            setSyncs(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <span>Loading syncs...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">⚠️</div>
                <h2>Error loading syncs</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Weekly Syncs</h1>
                <Link to="/create" className="btn btn-primary">
                    <span>+</span>
                    <span>Create New Sync</span>
                </Link>
            </div>

            {syncs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h2>No syncs yet</h2>
                    <p>Create your first weekly sync to get started!</p>
                    <Link to="/create" className="btn btn-primary">
                        Create New Sync
                    </Link>
                </div>
            ) : (
                <div className="cards-grid">
                    {syncs.map(sync => (
                        <SyncCard key={sync.id} sync={sync} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Home

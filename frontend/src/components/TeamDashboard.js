import React, { useState, useEffect } from 'react';
import api from '../api';

const TeamDashboard = () => {
  const [teamData, setTeamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamData();
    const interval = setInterval(fetchTeamData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await api.get('/api/dashboard/team');
      setTeamData(response.data);
      setError('');
    } catch (fetchError) {
      setError('Could not load team dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading team dashboard...</div>;
  }

  const getStatusBadge = (username) => {
    const colors = {
      SHAHKAR: '#0f766e',
      ABRAR: '#2563eb',
      ANSAR: '#c2410c'
    };
    return colors[username] || '#334155';
  };

  return (
    <>
      {error && <div className="error-message inline">{error}</div>}
      <div className="team-grid">
        {Object.entries(teamData).map(([username, data]) => (
          <div key={username} className="team-card" style={{ borderTopColor: getStatusBadge(username) }}>
            <div className="team-card-header">
              <h3 style={{ color: getStatusBadge(username) }}>{username}</h3>
              <span>{data.role}</span>
            </div>

            {data.youtube && (
              <div className="team-card-section">
                <h4>YouTube Automation</h4>
                <div className="team-card-stat">
                  <span className="stat-label">Videos Created</span>
                  <span className="stat-value">{data.youtube.videosCreated}</span>
                </div>
                <div className="team-card-stat">
                  <span className="stat-label">Next Week Target</span>
                  <span className="stat-value">{data.youtube.videosNextWeek}</span>
                </div>
                <div className="team-card-stat">
                  <span className="stat-label">Scheduled</span>
                  <span className="stat-value">{data.youtube.videosScheduled?.length || 0}</span>
                </div>
                {data.youtube.notes && (
                  <div className="note-box">
                    <strong>Notes:</strong> {data.youtube.notes}
                  </div>
                )}
              </div>
            )}

            {data.trading && (
              <div className="team-card-section">
                <h4>Trading</h4>
                <div className="team-card-stat">
                  <span className="stat-label">Positions Open</span>
                  <span className="stat-value">{data.trading.positionsOpen}</span>
                </div>
                <div className="team-card-stat">
                  <span className="stat-label">Positions Closed</span>
                  <span className="stat-value">{data.trading.positionsClosed}</span>
                </div>
                <div className="team-card-stat">
                  <span className="stat-label">P&L</span>
                  <span className={`stat-value ${data.trading.pnl >= 0 ? 'positive' : 'negative'}`}>
                    ${Number(data.trading.pnl || 0).toFixed(2)}
                  </span>
                </div>
                {data.trading.notes && (
                  <div className="note-box">
                    <strong>Notes:</strong> {data.trading.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default TeamDashboard;

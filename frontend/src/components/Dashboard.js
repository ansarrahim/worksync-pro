import React, { useState } from 'react';
import YouTubeSection from './YouTubeSection';
import TradingSection from './TradingSection';
import TeamDashboard from './TeamDashboard';
import TasksBoard from './TasksBoard';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('updates');
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Team workspace</p>
            <h1>WorkSync Pro</h1>
          </div>
          <div className="user-info">
            <div className="user-badge">
              <strong>{user.username}</strong>
              <span>{user.role}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <nav className="tabs-container" aria-label="Dashboard sections">
          <button
            className={`tab-button ${activeTab === 'updates' ? 'active' : ''}`}
            onClick={() => setActiveTab('updates')}
          >
            Updates
          </button>
          <button
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Dashboard
          </button>
          <button
            className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Action Items
          </button>
        </nav>

        {activeTab === 'updates' && (
          <div className="content-area">
            {(user.role === 'YouTube' || user.role === 'Manager') && (
              <YouTubeSection user={user} onSuccess={showSuccess} />
            )}
            {(user.role === 'Trading' || user.role === 'Manager') && (
              <TradingSection user={user} onSuccess={showSuccess} />
            )}
          </div>
        )}

        {activeTab === 'team' && user.role === 'Manager' && (
          <TeamDashboard />
        )}
        {activeTab === 'team' && user.role !== 'Manager' && (
          <div className="card empty-state">
            Only managers can view the team dashboard.
          </div>
        )}

        {activeTab === 'tasks' && (
          <TasksBoard user={user} onSuccess={showSuccess} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

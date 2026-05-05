import React, { useState, useEffect } from 'react';
import api from '../api';
import DiscussionTab from './DiscussionTab';

const YouTubeSection = ({ onSuccess }) => {
  const [updates, setUpdates] = useState({
    videosCreated: 0,
    videosScheduled: [],
    videosNextWeek: 0,
    notes: ''
  });
  const [newScheduledVideo, setNewScheduledVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await api.get('/api/youtube/updates');
      setUpdates(response.data);
    } catch (fetchError) {
      setError('Could not load YouTube updates.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdates({
      ...updates,
      [name]: name === 'videosCreated' || name === 'videosNextWeek' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleAddScheduledVideo = () => {
    const nextVideo = newScheduledVideo.trim();
    if (!nextVideo) return;

    setUpdates({
      ...updates,
      videosScheduled: [...updates.videosScheduled, nextVideo]
    });
    setNewScheduledVideo('');
  };

  const handleRemoveScheduledVideo = (index) => {
    setUpdates({
      ...updates,
      videosScheduled: updates.videosScheduled.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/youtube/updates', updates);
      onSuccess('YouTube update saved.');
      fetchUpdates();
    } catch (saveError) {
      setError('Could not save YouTube update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-heading">
          <p className="eyebrow">Production</p>
          <h2>YouTube Automation</h2>
        </div>

        {error && <div className="error-message inline">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="metrics-row">
            <div className="form-group">
              <label>Videos Created This Week</label>
              <input
                type="number"
                name="videosCreated"
                value={updates.videosCreated}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Next Week Target</label>
              <input
                type="number"
                name="videosNextWeek"
                value={updates.videosNextWeek}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Scheduled Videos</label>
            <div className="scheduled-list">
              {updates.videosScheduled.map((video, index) => (
                <div key={`${video}-${index}`} className="scheduled-item">
                  <span>{video}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveScheduledVideo(index)}
                    className="small-danger-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="inline-input">
              <input
                type="text"
                value={newScheduledVideo}
                onChange={(e) => setNewScheduledVideo(e.target.value)}
                placeholder="Add scheduled video..."
              />
              <button
                type="button"
                onClick={handleAddScheduledVideo}
                className="small-success-btn"
              >
                Add
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={updates.notes}
              onChange={handleInputChange}
              placeholder="Add priorities, blockers, or production notes..."
            />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Update'}
          </button>
        </form>
      </div>

      <DiscussionTab category="youtube" title="YouTube Discussion" />
    </>
  );
};

export default YouTubeSection;

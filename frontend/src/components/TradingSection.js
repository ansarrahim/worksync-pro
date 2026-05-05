import React, { useState, useEffect } from 'react';
import api from '../api';
import DiscussionTab from './DiscussionTab';

const TradingSection = ({ onSuccess }) => {
  const [updates, setUpdates] = useState({
    positionsOpen: 0,
    positionsClosed: 0,
    pnl: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await api.get('/api/trading/updates');
      setUpdates(response.data);
    } catch (fetchError) {
      setError('Could not load trading updates.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdates({
      ...updates,
      [name]: name === 'positionsOpen' || name === 'positionsClosed' ? parseInt(value, 10) || 0 : parseFloat(value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/trading/updates', updates);
      onSuccess('Trading update saved.');
      fetchUpdates();
    } catch (saveError) {
      setError('Could not save trading update.');
    } finally {
      setLoading(false);
    }
  };

  const pnlColor = updates.pnl >= 0 ? '#0f766e' : '#b91c1c';

  return (
    <>
      <div className="card">
        <div className="card-heading">
          <p className="eyebrow">Markets</p>
          <h2>Trading Updates</h2>
        </div>

        {error && <div className="error-message inline">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="metrics-row">
            <div className="form-group">
              <label>Positions Open</label>
              <input
                type="number"
                name="positionsOpen"
                value={updates.positionsOpen}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Positions Closed</label>
              <input
                type="number"
                name="positionsClosed"
                value={updates.positionsClosed}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>P&L (Profit & Loss)</label>
            <input
              type="number"
              name="pnl"
              value={updates.pnl}
              onChange={handleInputChange}
              step="0.01"
            />
            <div className="pnl-readout" style={{ color: pnlColor }}>
              {updates.pnl >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(updates.pnl).toFixed(2)}
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={updates.notes}
              onChange={handleInputChange}
              placeholder="Add trading notes, position details, or strategy..."
            />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Update'}
          </button>
        </form>
      </div>

      <DiscussionTab category="trading" title="Trading Discussion" />
    </>
  );
};

export default TradingSection;

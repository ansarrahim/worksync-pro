import React, { useState, useEffect } from 'react';
import api from '../api';

const DiscussionTab = ({ category, title }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/api/discussions/${category}`);
        setMessages(response.data);
        setError('');
      } catch (fetchError) {
        setError('Messages are temporarily unavailable.');
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [category]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post(
        '/api/discussions',
        {
          category,
          message: newMessage.trim()
        }
      );
      setMessages([response.data, ...messages]);
      setNewMessage('');
    } catch (sendError) {
      setError('Could not send message.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card discussion-container">
      <div className="card-heading">
        <p className="eyebrow">Discussion</p>
        <h2>{title}</h2>
      </div>

      {error && <div className="error-message inline">{error}</div>}

      <div className="discussion-messages">
        {messages.length === 0 ? (
          <p className="empty-message">
            No messages yet. Start the discussion.
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-header">
                <span className="message-author">{msg.userName}</span>
                <span className="message-time">{formatTime(msg.createdAt)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage}>
        <div className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            className="btn-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiscussionTab;

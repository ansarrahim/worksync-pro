import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

const emptyTask = {
  title: '',
  details: '',
  category: 'General',
  assignedTo: 'Team',
  priority: 'Medium',
  dueDate: ''
};

const columns = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' }
];

const teamMembers = ['Team', 'SHAHKAR', 'ABRAR', 'ANSAR'];
const categories = ['General', 'YouTube', 'Trading', 'Follow-up'];
const priorities = ['High', 'Medium', 'Low'];

const TasksBoard = ({ user, onSuccess }) => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data);
      setError('');
    } catch (fetchError) {
      setError('Could not load action items.');
    } finally {
      setLoading(false);
    }
  };

  const groupedTasks = useMemo(() => {
    return columns.reduce((groups, column) => {
      groups[column.key] = tasks.filter((task) => task.status === column.key);
      return groups;
    }, {});
  }, [tasks]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    setError('');
    try {
      await api.post('/api/tasks', form);
      setForm(emptyTask);
      onSuccess('Action item created.');
      fetchTasks();
    } catch (createError) {
      setError(createError.response?.data?.error || 'Could not create action item.');
    } finally {
      setSaving(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, updates);
      fetchTasks();
    } catch (updateError) {
      setError(updateError.response?.data?.error || 'Could not update action item.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      onSuccess('Action item removed.');
      fetchTasks();
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || 'Could not delete action item.');
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    return new Date(`${dueDate}T00:00:00`).toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading action items...</div>;
  }

  return (
    <div className="tasks-layout">
      {user.role === 'Manager' && (
        <div className="card task-form-card">
          <div className="card-heading">
            <p className="eyebrow">Planning</p>
            <h2>Create Action Item</h2>
          </div>

          <form onSubmit={createTask}>
            <div className="form-group">
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="What needs to happen?"
                required
              />
            </div>

            <div className="task-form-grid">
              <div className="form-group">
                <label>Owner</label>
                <select name="assignedTo" value={form.assignedTo} onChange={handleFormChange}>
                  {teamMembers.map((member) => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleFormChange}>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleFormChange}>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Details</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleFormChange}
                placeholder="Add context, links, or success criteria..."
              />
            </div>

            <button className="btn-submit" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Action Item'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="error-message inline">{error}</div>}

      <div className="task-board">
        {columns.map((column) => (
          <section key={column.key} className="task-column">
            <div className="task-column-header">
              <h3>{column.label}</h3>
              <span>{groupedTasks[column.key]?.length || 0}</span>
            </div>

            <div className="task-stack">
              {(groupedTasks[column.key] || []).length === 0 ? (
                <div className="task-empty">No items</div>
              ) : (
                groupedTasks[column.key].map((task) => (
                  <article key={task.id} className={`task-card priority-${task.priority.toLowerCase()}`}>
                    <div className="task-card-top">
                      <span className="task-category">{task.category}</span>
                      <span className="task-priority">{task.priority}</span>
                    </div>
                    <h4>{task.title}</h4>
                    {task.details && <p>{task.details}</p>}
                    <div className="task-meta">
                      <span>Owner: {task.assignedTo}</span>
                      <span>Due: {formatDueDate(task.dueDate)}</span>
                    </div>

                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(task.id, { status: e.target.value })}
                      >
                        {columns.map((status) => (
                          <option key={status.key} value={status.key}>{status.label}</option>
                        ))}
                      </select>

                      {user.role === 'Manager' && (
                        <button
                          type="button"
                          className="small-danger-btn"
                          onClick={() => deleteTask(task.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TasksBoard;

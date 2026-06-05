import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const TaskModal = ({ isOpen, onClose, onSaved, teams, task }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    due_date: '',
    team_id: '',
    assigned_to: '',
  });

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Setup form when modal opens or when switching between Create/Edit mode
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        // HTML <input type="date"> requires exact YYYY-MM-DD format
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        team_id: task.team_id || (teams.length > 0 ? teams[0].id : ''),
        assigned_to: task.assigned_to || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        status: 'pending',
        due_date: '',
        team_id: teams.length > 0 ? teams[0].id : '',
        assigned_to: '',
      });
    }
    setError('');
  }, [task, isOpen, teams]);

  // 2. Fetch team members dynamically whenever the selected Team dropdown changes
  useEffect(() => {
    const fetchMembers = async () => {
      if (!form.team_id) {
        setMembers([]);
        return;
      }
      try {
        const response = await api.get(`/api/teams/${form.team_id}/members`);
        setMembers(response.data);
      } catch (err) {
        console.error('Failed to fetch team members', err);
        setMembers([]);
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [form.team_id, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Smart UX: If the user changes the Team, clear the Assignee field 
      // since the old assignee might not be a member of the newly selected team.
      if (name === 'team_id') {
        updated.assigned_to = '';
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Prepare payload: convert empty strings back to `null` to respect PostgreSQL types
    const payload = {
      ...form,
      team_id: form.team_id ? parseInt(form.team_id, 10) : null,
      assigned_to: form.assigned_to ? parseInt(form.assigned_to, 10) : null,
      due_date: form.due_date || null,
    };

    try {
      if (task) {
        // Edit Mode -> PUT request
        await api.put(`/api/tasks/${task.id}`, payload);
      } else {
        // Create Mode -> POST request
        await api.post('/api/tasks', payload);
      }
      
      onSaved(); // Triggers a re-fetch of the task list in the parent component
      onClose(); // Hides the modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="E.g., Update landing page copy"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              placeholder="Add more details about this task..."
            />
          </div>

          {/* 2-Column Grid for Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Team Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
              <select
                name="team_id"
                required
                value={form.team_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="" disabled>Select a team</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee Dropdown (Populated by API based on selected Team) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                disabled={!form.team_id}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Due Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.team_id}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default TaskModal;

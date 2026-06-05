import { useState } from 'react';
import api from '../api/axiosInstance';

const TeamsSidebar = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  onTeamCreated,
  onTeamDeleted,
  currentUserId,
}) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Handle creating a new team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreating(true);
    setCreateError('');

    try {
      await api.post('/api/teams', { name: newTeamName });
      setNewTeamName(''); // Clear input
      onTeamCreated();    // Tell parent to refetch data
    } catch (error) {
      setCreateError(
        error.response?.data?.message || 'Failed to create team.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Handle deleting a team
  const handleDeleteTeam = async (e, teamId) => {
    // Prevent the click from bubbling up and triggering `onSelectTeam`
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this team? All tasks inside will be lost.')) {
      return;
    }

    try {
      await api.delete(`/api/teams/${teamId}`);
      onTeamDeleted(); // Tell parent to refetch data and reset selection if needed
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete team.');
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      
      {/* Top Section: Header & Create Form */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-3 tracking-wide text-sm uppercase">Teams</h2>
        
        <form onSubmit={handleCreateTeam} className="flex gap-2">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="New team name..."
            className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating || !newTeamName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isCreating ? '...' : 'Add'}
          </button>
        </form>
        
        {/* Validation Error Text */}
        {createError && (
          <p className="text-red-500 text-xs mt-2">{createError}</p>
        )}
      </div>

      {/* Bottom Section: Teams List */}
      <div className="flex-1 py-2 overflow-y-auto">
        
        {/* Always present "All Teams" filter */}
        <button
          onClick={() => onSelectTeam(null)}
          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
            selectedTeamId === null
              ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          All Teams
        </button>

        {/* Dynamically mapped teams */}
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => onSelectTeam(team.id)}
            className={`group w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
              selectedTeamId === team.id
                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="truncate pr-2">{team.name}</span>
            
            {/* Delete Button - Only renders if the logged-in user created this specific team */}
            {/* Uses group-hover so the 'X' only appears when mousing over the team name row */}
            {team.created_by === currentUserId && (
              <button
                onClick={(e) => handleDeleteTeam(e, team.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1 rounded-md"
                title="Delete Team"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        
        {teams.length === 0 && (
          <div className="px-4 py-4 text-sm text-gray-400 text-center italic">
            You don't belong to any teams yet.
          </div>
        )}
      </div>
      
    </div>
  );
};

export default TeamsSidebar;

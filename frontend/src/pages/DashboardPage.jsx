import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TeamsSidebar from '../components/TeamsSidebar';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import AddMemberModal from '../components/AddMemberModal';

const DashboardPage = () => {
  const { user } = useAuth();
  
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState(null);
  
  const [tasksLoading, setTasksLoading] = useState(true);
  const [showReminder, setShowReminder] = useState(true);

  // Compute tasks that are due within 48 hours and not done
  const urgentTasks = useMemo(() => {
    const now = new Date();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    
    return tasks.filter(task => {
      if (!task.due_date || task.status === 'done') return false;
      const diff = new Date(task.due_date) - now;
      // Show tasks due in less than 48 hours (including those already past due)
      return diff <= fortyEightHoursMs;
    });
  }, [tasks]);

  // Memoized fetch functions so they can be safely passed to useEffect dependencies
  const fetchTeams = useCallback(async () => {
    try {
      const response = await api.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch teams', error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      // Append query param if a specific team is selected
      const url = selectedTeamId ? `/api/tasks?team_id=${selectedTeamId}` : '/api/tasks';
      const response = await api.get(url);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setTasksLoading(false);
    }
  }, [selectedTeamId]);

  // Initial load
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Re-fetch tasks whenever the selected team changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, selectedTeamId]);

  // ─── Task Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      fetchTasks(); // Refresh list after deletion
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const handleTaskSaved = () => {
    setIsTaskModalOpen(false);
    fetchTasks();
  };

  // ─── Team Handlers ─────────────────────────────────────────────────────────
  const handleSelectTeam = (id) => {
    setSelectedTeamId(id);
  };

  const handleTeamCreated = () => {
    fetchTeams();
    fetchTasks();
  };

  const handleTeamDeleted = () => {
    setSelectedTeamId(null); // Reset selection
    fetchTeams();
    fetchTasks();
  };

  const handleOpenAddMember = () => {
    const team = teams.find(t => t.id === selectedTeamId);
    if (team) {
      setSelectedTeamForMember(team);
      setIsAddMemberModalOpen(true);
    }
  };

  // Helper for UI
  const currentTeamName = selectedTeamId 
    ? teams.find(t => t.id === selectedTeamId)?.name || 'Loading...'
    : 'All Tasks';

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main App Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <TeamsSidebar
          teams={teams}
          selectedTeamId={selectedTeamId}
          onSelectTeam={handleSelectTeam}
          onTeamCreated={handleTeamCreated}
          onTeamDeleted={handleTeamDeleted}
          currentUserId={user?.id}
        />

        {/* Center Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col h-full">
            
            {/* Urgent Tasks Reminder Banner */}
            {showReminder && urgentTasks.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 relative shadow-sm">
                <button
                  onClick={() => setShowReminder(false)}
                  className="absolute top-3 right-3 text-amber-500 hover:text-amber-700 transition-colors"
                  title="Dismiss reminder"
                >
                  ✕
                </button>
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="text-amber-800 font-semibold mb-1">
                      You have {urgentTasks.length} task(s) due within 48 hours:
                    </h3>
                    <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                      {urgentTasks.map(t => (
                        <li key={t.id}>
                          <span className="font-medium">{t.title}</span> 
                          <span className="opacity-75 ml-2">
                            (Due: {new Date(t.due_date).toLocaleDateString()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Top action bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              
              {/* Heading */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  {currentTeamName}
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Only show Add Member if a specific team is selected (not "All Tasks") */}
                {selectedTeamId && (
                  <button
                    onClick={handleOpenAddMember}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-700 shadow-sm rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Add Member
                  </button>
                )}
                
                <button
                  onClick={handleOpenCreateTask}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white shadow-sm shadow-blue-200 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  + New Task
                </button>
              </div>
            </div>

            {/* Render the Task List container */}
            <TaskList
              tasks={tasks}
              loading={tasksLoading}
              onEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
            />

          </div>
        </main>
      </div>

      {/* Modals are placed globally here so they overlay the entire app */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaved={handleTaskSaved}
        teams={teams}
        task={editingTask}
      />

      {/* Prevent rendering the Add Member modal until a team is actually selected for it */}
      {selectedTeamForMember && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          teamId={selectedTeamForMember.id}
          teamName={selectedTeamForMember.name}
          onClose={() => setIsAddMemberModalOpen(false)}
          onMemberAdded={() => setIsAddMemberModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;

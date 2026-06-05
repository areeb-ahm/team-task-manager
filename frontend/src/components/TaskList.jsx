import { useState } from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, onEditTask, onDeleteTask, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Client-side filtering logic
  const filteredTasks = tasks.filter((task) => {
    // Check if the search query matches the task title or the assignee's name
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.assignee_name &&
        task.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Check if the task status matches the dropdown filter
    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col w-full h-full">
      
      {/* Top Summary Row */}
      <div className="mb-3 text-sm text-gray-500 font-medium">
        Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-6">
        
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search tasks by title or assignee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
        />
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((skeletonIndex) => (
            <div
              key={skeletonIndex}
              className="bg-gray-100 rounded-xl h-36 animate-pulse border border-gray-200"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200 border-dashed">
          <p className="text-gray-500 font-medium">No tasks found.</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or create your first task!</p>
        </div>
      ) : (
        /* Rendered Task Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default TaskList;

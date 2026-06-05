const STATUS_COLORS = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'done': 'bg-green-100 text-green-800',
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  // Check if a task is past due (only applies if it has a due date and isn't done)
  const isPastDue = () => {
    if (!task.due_date || task.status === 'done') return false;
    
    // Normalize both dates to midnight for fair day-level comparison
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return due < today;
  };

  // Capitalize strings like "in-progress" -> "In-progress"
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow relative flex flex-col h-full">
      
      {/* Top right action buttons (visible on hover) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-100 px-1 py-0.5 z-10">
        <button 
          onClick={() => onEdit(task)}
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 text-sm px-2 py-1 rounded"
          title="Edit Task"
        >
          ✏️
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="text-red-400 hover:text-red-600 hover:bg-red-50 text-sm px-2 py-1 rounded"
          title="Delete Task"
        >
          🗑️
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800'}`}>
          {capitalize(task.status)}
        </span>
      </div>

      {/* Title & Description */}
      {/* Padding right prevents long titles from hiding behind the hover buttons */}
      <h3 className="font-semibold text-gray-800 text-base mt-1 pr-16 line-clamp-2">
        {task.title}
      </h3>
      
      {task.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-grow">
          {task.description}
        </p>
      )}

      {/* Spacer to push metadata to the bottom if description is short or missing */}
      {!task.description && <div className="flex-grow"></div>}

      {/* Bottom Metadata Row */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
        
        {/* Team Name */}
        {task.team_name && (
          <div className="flex items-center gap-1.5" title="Team">
            <span>🏷️</span>
            <span className="font-medium text-gray-600">{task.team_name}</span>
          </div>
        )}

        {/* Assignee */}
        {task.assignee_name && (
          <div className="flex items-center gap-1.5" title="Assigned to">
            <span>👤</span>
            <span className="truncate max-w-[100px]">{task.assignee_name}</span>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div className={`flex items-center gap-1.5 ${isPastDue() ? 'text-red-600 font-semibold' : ''}`} title="Due Date">
            <span>📅</span>
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default TaskCard;

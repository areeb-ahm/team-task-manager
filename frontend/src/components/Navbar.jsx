import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  // Safely grab the first letter of the user's name for the avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : '?';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex-shrink-0">
          <span className="text-xl font-bold text-blue-600 tracking-tight">
            TaskManager
          </span>
        </div>

        {/* Right Side: User Profile & Logout */}
        <div className="flex items-center space-x-4">
          
          {/* Welcome Text */}
          <span className="text-sm text-gray-600 hidden sm:inline">
            Hello, <span className="font-medium text-gray-900">{user?.name}</span>
          </span>
          
          {/* Circular Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
            {getInitial()}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Wrapper Component
 * 
 * Usage inside your React Router setup (e.g., App.jsx or main.jsx):
 * 
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 * 
 * This component acts as a gatekeeper. If someone tries to manually type 
 * "/dashboard" into their URL bar but they aren't logged in, this component 
 * catches them and redirects them straight to "/login".
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for AuthProvider to finish its initial API session check
  if (loading) {
    return null; // The AuthProvider is already displaying a "Loading..." UI
  }

  // If we know the check is done and the user is null, bounce them out
  if (!user) {
    // We use `replace` so the login page replaces the protected route in 
    // the browser history, preventing them from hitting "back" to return here.
    return <Navigate to="/login" replace />;
  }

  // Otherwise, the user is authenticated — let them see the page!
  return children;
};

export default ProtectedRoute;

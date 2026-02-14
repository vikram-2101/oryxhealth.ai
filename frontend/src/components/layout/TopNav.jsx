import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return ['Dashboard'];
    
    return paths.map((path) => path.charAt(0).toUpperCase() + path.slice(1));
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'font-semibold text-slate-900'
                    : 'text-slate-500'
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

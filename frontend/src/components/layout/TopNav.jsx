import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBreadcrumbs } from '../../context/BreadcrumbContext';

export const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { breadcrumbNames } = useBreadcrumbs();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ label: 'Dashboard', path: '/' }];
    
    let currentPath = '';
    return paths.map((segment) => {
      currentPath += `/${segment}`;
      // Check if we have a mapped name for this segment (ID)
      const label = breadcrumbNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return {
        label,
        path: currentPath
      };
    });
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
                    : 'text-slate-500 hover:text-slate-700 cursor-pointer transition-colors'
                }
                onClick={() => index < breadcrumbs.length - 1 && navigate(crumb.path)}
              >
                {crumb.label}
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

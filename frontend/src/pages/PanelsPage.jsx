import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Layers, Users } from 'lucide-react';
import { panelService } from '../services';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { StatusToggleSwitch } from '../components/ui/StatusToggleSwitch';

export const PanelsPage = () => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { error, success } = useToast();

  useEffect(() => {
    loadPanels();
  }, [currentPage, searchTerm]);

  const loadPanels = async () => {
    try {
      setLoading(true);
      const response = await panelService.getAll({ page: currentPage, search: searchTerm });
      setPanels(response.data.panels);
      setTotalPages(response.data.pages);
    } catch (err) {
      error('Failed to load panels');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await panelService.toggleStatus(id);
      success(`Panel ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
      loadPanels();
    } catch (err) {
      error('Failed to update status');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panels</h1>
          <p className="text-slate-600 mt-1">{panels?.length || 0} active panels</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Panel
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search panels..."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !panels || panels.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No panels found"
          description="Get started by creating your first panel"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {panels.map((panel, index) => (
              <motion.div
                key={panel._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getInitials(panel.name)}
                  </div>
                  <StatusToggleSwitch
                    checked={panel.status === 'active'}
                    onChange={() => handleStatusToggle(panel._id, panel.status)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">
                    {panel.name}
                  </h3>
                  {panel.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {panel.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary-600" />
                      <span className="text-slate-600">
                        {panel.users?.length || 0} members
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        panel.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {panel.status.toUpperCase()}
                    </span>
                  </div>

                  {panel.users && panel.users.length > 0 && (
                    <div className="mt-3 flex -space-x-2">
                      {panel.users.slice(0, 5).map((user, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white"
                          title={user.name}
                        >
                          {getInitials(user.name)}
                        </div>
                      ))}
                      {panel.users.length > 5 && (
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white">
                          +{panel.users.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

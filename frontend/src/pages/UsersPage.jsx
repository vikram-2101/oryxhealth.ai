import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Mail, Phone, Stethoscope, UserCog, ClipboardList } from 'lucide-react';
import { userService, institutionService } from '../services';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { StatusToggleSwitch } from '../components/ui/StatusToggleSwitch';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { error, success } = useToast();

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, selectedRole, selectedInstitution]);

  const loadInstitutions = async () => {
    try {
      const response = await institutionService.getAll({ limit: 100 });
      setInstitutions(response.data.institutions);
    } catch (err) {
      console.error('Failed to load institutions');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll({
        page: currentPage,
        search: searchTerm,
        role: selectedRole,
        institution: selectedInstitution,
      });
      setUsers(response.data.users);
      setTotalPages(response.data.pages);
    } catch (err) {
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await userService.toggleStatus(id);
      success(`User ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
      loadUsers();
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Doctor':
        return <Stethoscope className="w-4 h-4" />;
      case 'Health Worker':
        return <UserCog className="w-4 h-4" />;
      case 'Coordinator':
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Doctor':
        return 'bg-blue-100 text-blue-700';
      case 'Health Worker':
        return 'bg-emerald-100 text-emerald-700';
      case 'Coordinator':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 mt-1">{users?.length || 0} registered users</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users..."
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Roles</option>
          <option value="Doctor">Doctor</option>
          <option value="Health Worker">Health Worker</option>
          <option value="Coordinator">Coordinator</option>
        </select>
        <select
          value={selectedInstitution}
          onChange={(e) => setSelectedInstitution(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Institutions</option>
          {institutions?.map((institution) => (
            <option key={institution._id} value={institution._id}>
              {institution.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : !users || users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Get started by adding your first user"
        />
      ) : (
        <>
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Reg. No.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {user.institution?.name || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{user.contactNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 font-mono">
                          {user.registrationNumber || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusToggleSwitch
                          checked={user.status === 'active'}
                          onChange={() => handleStatusToggle(user._id, user.status)}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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

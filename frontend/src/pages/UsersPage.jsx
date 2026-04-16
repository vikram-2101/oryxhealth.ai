import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Stethoscope, HeartHandshake, UserCog, Edit, Trash2 } from 'lucide-react';
import { userService, institutionService } from '../services';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusToggleSwitch } from '../components/ui/StatusToggleSwitch';
import { FormModal } from '../components/ui/FormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { UserForm } from '../components/forms/UserForm';

const roleIcons = {
  Doctor: Stethoscope,
  'Health Worker': HeartHandshake,
  Coordinator: UserCog,
};

const roleColors = {
  Doctor: 'bg-primary-100 text-primary-700',
  'Health Worker': 'bg-emerald-100 text-emerald-700',
  Coordinator: 'bg-amber-100 text-amber-700',
};

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, institutionsRes] = await Promise.all([
        userService.getAll(),
        institutionService.getAll(),
      ]);
      setUsers(usersRes.data.users || usersRes.data);
      setInstitutions(institutionsRes.data.institutions || institutionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await userService.update(selectedUser._id, formData);
      } else {
        await userService.create(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      await userService.toggleStatus(id);
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesInstitution =
      !selectedInstitution || user.institution?._id === selectedInstitution;
    return matchesSearch && matchesRole && matchesInstitution;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 mt-1">{users?.length || 0} registered users</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
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
          icon={UserCog}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Reg. No.
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedUsers.map((user) => {
                    const RoleIcon = roleIcons[user.role];
                    return (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-700 overflow-hidden shadow-sm border border-slate-200">
                              {user.photo ? (
                                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                getInitials(user.name)
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${
                              roleColors[user.role]
                            }`}
                          >
                            <RoleIcon className="w-4 h-4" />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.institution?.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.phone}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {user.role === 'Doctor' ? user.registrationNumber || '—' : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <StatusToggleSwitch
                              checked={user.status === 'active'}
                              onChange={() => handleStatusToggle(user._id)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(user)}
                              className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
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

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

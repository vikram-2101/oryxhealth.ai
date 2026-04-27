import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, CalendarDays } from 'lucide-react';
import { appointmentTypeService, customerService } from '../services';
import { SearchBar } from '../components/ui/SearchBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { FormModal } from '../components/ui/FormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { AppointmentTypeForm } from '../components/forms/AppointmentTypeForm';
import { useAuth } from '../context/AuthContext';

export const AppointmentTypesPage = () => {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(
    user?.role === 'account' ? user.accountId : 'all'
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesRes, customersRes] = await Promise.all([
        appointmentTypeService.getAll({ accountId: user?.role === 'account' ? user.accountId : undefined }),
        user?.role === 'super_admin' ? customerService.getAll() : Promise.resolve({ data: { customers: [] } }),
      ]);
      setTypes(typesRes.data);
      setCustomers(customersRes.data?.customers || customersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (type) => {
    setSelectedType(type);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedType) {
        await appointmentTypeService.update(selectedType._id, formData);
      } else {
        await appointmentTypeService.create(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving appointment type:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await appointmentTypeService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting type:', error);
    }
  };

  const filteredTypes = types.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesAccount = selectedAccount === 'all' || t.accountId?._id === selectedAccount;
    return matchesSearch && matchesAccount;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointment Types</h1>
          <p className="text-slate-600 mt-1">Configure appointment types for each account</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Type
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search types..."
          />
        </div>
        {user?.role === 'super_admin' && (
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[200px]"
          >
            <option value="all">All Accounts</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredTypes.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointment types found"
          description="Get started by adding your first appointment type"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTypes.map((type, index) => (
                <motion.tr
                  key={type._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{type.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{type.accountId?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(type)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedType ? 'Edit Type' : 'Add New Type'}
      >
        <AppointmentTypeForm
          type={selectedType}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Type"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
      />
    </div>
  );
};

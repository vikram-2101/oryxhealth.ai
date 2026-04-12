import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, Building, Users as UsersIcon, Edit, Trash2 } from 'lucide-react';
import { institutionService, customerService } from '../services';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusToggleSwitch } from '../components/ui/StatusToggleSwitch';
import { FormModal } from '../components/ui/FormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { InstitutionForm } from '../components/forms/InstitutionForm';

export const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [institutionsRes, customersRes] = await Promise.all([
        institutionService.getAll(),
        customerService.getAll(),
      ]);
      setInstitutions(institutionsRes.data.institutions || institutionsRes.data);
      setCustomers(customersRes.data.customers || customersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedInstitution(null);
    setIsFormOpen(true);
  };

  const handleEdit = (institution) => {
    setSelectedInstitution(institution);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedInstitution) {
        await institutionService.update(selectedInstitution._id, formData);
      } else {
        await institutionService.create(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving institution:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await institutionService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting institution:', error);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      await institutionService.toggleStatus(id);
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.contactPerson?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesCustomer = !selectedCustomer || inst.customer?._id === selectedCustomer;
    return matchesSearch && matchesCustomer;
  });

  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);
  const paginatedInstitutions = filteredInstitutions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Institutions</h1>
          <p className="text-slate-600 mt-1">{institutions?.length || 0} registered institutions</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Institution
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search institutions..."
          />
        </div>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Customers</option>
          {customers?.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !institutions || institutions.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No institutions found"
          description="Get started by adding your first institution"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedInstitutions.map((institution, index) => (
              <motion.div
                key={institution._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium p-5 space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">
                    {institution.logo}
                  </div>
                  <StatusToggleSwitch
                    checked={institution.status === 'active'}
                    onChange={() => handleStatusToggle(institution._id)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {institution.name}
                  </h3>
                  <p className="text-sm text-primary-600 font-medium">
                    {institution.customer?.name}
                  </p>
                  <div className="space-y-2 text-sm text-slate-600 mt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{institution.contactPerson?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{institution.contactPerson?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <UsersIcon className="w-4 h-4 text-primary-600" />
                    <span className="text-slate-600">{institution.usersCount || 0} users</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      institution.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {institution.status?.toUpperCase()}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(institution)}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(institution)}
                    className="flex-1 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
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

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedInstitution ? 'Edit Institution' : 'Add New Institution'}
      >
        <InstitutionForm
          institution={selectedInstitution}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Institution"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building, Mail, Phone, Users } from 'lucide-react';
import { institutionService, customerService } from '../services';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { StatusToggleSwitch } from '../components/ui/StatusToggleSwitch';

export const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { error, success } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadInstitutions();
  }, [currentPage, searchTerm, selectedCustomer]);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll({ limit: 100 });
      setCustomers(response.data.customers);
    } catch (err) {
      console.error('Failed to load customers');
    }
  };

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const response = await institutionService.getAll({
        page: currentPage,
        search: searchTerm,
        customerAccount: selectedCustomer,
      });
      setInstitutions(response.data.institutions);
      setTotalPages(response.data.pages);
    } catch (err) {
      error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await institutionService.toggleStatus(id);
      success(`Institution ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
      loadInstitutions();
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

  const getRandomColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-emerald-100 text-emerald-600',
      'bg-purple-100 text-purple-600',
      'bg-amber-100 text-amber-600',
      'bg-pink-100 text-pink-600',
      'bg-cyan-100 text-cyan-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Institutions</h1>
          <p className="text-slate-600 mt-1">{institutions?.length || 0} registered institutions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Institution
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions.map((institution, index) => (
              <motion.div
                key={institution._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${getRandomColor(
                      index
                    )}`}
                  >
                    {getInitials(institution.name)}
                  </div>
                  <StatusToggleSwitch
                    checked={institution.status === 'active'}
                    onChange={() => handleStatusToggle(institution._id, institution.status)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {institution.name}
                  </h3>
                  <p className="text-sm text-primary-600 font-medium mb-2">
                    {institution.customerAccount?.name || 'N/A'}
                  </p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{institution.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{institution.contactPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span className="text-slate-600">
                      {institution.usersCount || 0} users
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      institution.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {institution.status.toUpperCase()}
                  </span>
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

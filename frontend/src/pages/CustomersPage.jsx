import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { customerService } from '../services';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { StatusToggleSwitch } from '../components/ui/StatusToggleSwitch';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { error, success } = useToast();

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll({ page: currentPage, search: searchTerm });
      setCustomers(response.data.customers);
      setTotalPages(response.data.pages);
    } catch (err) {
      error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await customerService.toggleStatus(id);
      success(`Customer ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
      loadCustomers();
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
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">{customers?.length || 0} customer accounts</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search customers..."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !customers || customers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No customers found"
          description="Get started by adding your first customer"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customers.map((customer, index) => (
              <motion.div
                key={customer._id}
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
                    {getInitials(customer.name)}
                  </div>
                  <StatusToggleSwitch
                    checked={customer.status === 'active'}
                    onChange={() => handleStatusToggle(customer._id, customer.status)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {customer.name}
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{customer.contactPerson.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{customer.contactPerson.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-primary-600" />
                    <span className="text-slate-600">
                      {customer.institutionsCount || 0} institutions
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {customer.status.toUpperCase()}
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

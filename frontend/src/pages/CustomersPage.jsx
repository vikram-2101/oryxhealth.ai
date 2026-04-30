import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mail, Phone, Building2, Edit, Trash2, FileText, Upload, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { customerService } from '../services';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusToggleSwitch } from '../components/ui/StatusToggleSwitch';
import { FormModal } from '../components/ui/FormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CustomerForm } from '../components/forms/CustomerForm';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Template panel state
  const [templatePanelCustomer, setTemplatePanelCustomer] = useState(null);
  const [templateStatus, setTemplateStatus] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const itemsPerPage = 8;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      setCustomers(response.data.customers || response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => { setSelectedCustomer(null); setIsFormOpen(true); };
  const handleEdit = (customer) => { setSelectedCustomer(customer); setIsFormOpen(true); };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer._id, formData);
      } else {
        await customerService.create(formData);
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await customerService.delete(id);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      await customerService.toggleStatus(id);
      fetchCustomers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // ── Template panel ──
  const openTemplatePanel = async (customer) => {
    setTemplatePanelCustomer(customer);
    setUploadState('idle');
    setUploadError('');
    setTemplateStatus(null);
    setTemplateLoading(true);
    try {
      const res = await customerService.getReportTemplate(customer._id);
      if (res.data) setTemplateStatus(res.data);
    } catch (err) {
      console.error('Failed to load template status', err);
    } finally {
      setTemplateLoading(false);
    }
  };

  const closeTemplatePanel = () => {
    setTemplatePanelCustomer(null);
    setTemplateStatus(null);
    setUploadState('idle');
    setUploadError('');
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setUploadError('Please upload a valid .html file.');
      setUploadState('error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const htmlContent = e.target.result;
      setUploadState('uploading');
      setUploadError('');
      try {
        await customerService.uploadReportTemplate(templatePanelCustomer._id, htmlContent, file.name);
        setUploadState('success');
        setTemplateStatus({ fileName: file.name, uploadedAt: new Date().toISOString() });
      } catch (err) {
        console.error('Upload failed', err);
        setUploadState('error');
        setUploadError('Upload failed. Please try again.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleFileInput = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const TOKENS = [
    '{{patient_name}}', '{{patient_mrn}}',
    '{{patient_age}}', '{{patient_sex}}',
    '{{visit_date}}', '{{protocol_name}}',
    '{{doctor_name}}', '{{institution_name}}',
    '{{chief_complaint}}', '{{clinical_notes}}',
    '{{event_outcome}}', '{{follow_up_date}}',
    '{{field:FIELD_KEY}}',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">{customers?.length || 0} customer accounts</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." />

      {/* Customer Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !customers || customers.length === 0 ? (
        <EmptyState icon={Building2} title="No customers found" description="Get started by adding your first customer" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedCustomers.map((customer, index) => (
              <motion.div
                key={customer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium p-6 space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl bg-primary-100">
                    {customer.logo || getInitials(customer.name)}
                  </div>
                  <StatusToggleSwitch
                    checked={customer.status === 'active'}
                    onChange={() => handleStatusToggle(customer._id)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">{customer.name}</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{customer.contactPerson?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{customer.contactPerson?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-primary-600" />
                    <span className="text-slate-600">{customer.institutionsCount || 0} institutions</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {customer.status?.toUpperCase()}
                  </span>
                </div>

                {/* Actions — visible on hover */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors flex items-center justify-center gap-1.5 text-sm font-medium"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => openTemplatePanel(customer)}
                    className="flex-1 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors flex items-center justify-center gap-1.5 text-sm font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" /> Template
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(customer)}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center text-sm font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      )}

      {/* Edit/Create Modal */}
      <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'} size="lg">
        <CustomerForm customer={selectedCustomer} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />

      {/* ── Report Template Upload Panel ── */}
      <AnimatePresence>
        {templatePanelCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={closeTemplatePanel}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Report Template</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{templatePanelCustomer.name}</p>
                </div>
                <button onClick={closeTemplatePanel} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* Current Status */}
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Template</p>
                  {templateLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <LoadingSpinner /><span>Checking...</span>
                    </div>
                  ) : templateStatus ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{templateStatus.fileName}</p>
                        <p className="text-xs text-slate-500">
                          Uploaded {templateStatus.uploadedAt
                            ? new Date(templateStatus.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-sm text-slate-600">No template configured yet. Upload one below.</p>
                    </div>
                  )}
                </div>

                {/* Token Reference */}
                <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                  <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-3">Available Tokens</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TOKENS.map((token, i) => (
                      <span key={i} className="bg-white border border-violet-100 text-violet-700 rounded-lg px-2 py-1.5 text-[11px] font-mono truncate">
                        {token}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-violet-500 mt-3">
                    Use <strong>{'{{field:your_field_key}}'}</strong> to inject any form field by key.
                  </p>
                </div>

                {/* Upload Zone */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">Upload HTML Template</p>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => uploadState !== 'uploading' && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all select-none ${
                      uploadState === 'uploading'
                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                        : dragOver
                        ? 'border-violet-400 bg-violet-50 scale-[1.01] cursor-copy'
                        : uploadState === 'success'
                        ? 'border-emerald-300 bg-emerald-50 cursor-pointer'
                        : uploadState === 'error'
                        ? 'border-red-300 bg-red-50 cursor-pointer'
                        : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 cursor-pointer'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept=".html,.htm" onChange={handleFileInput} className="hidden" />

                    {uploadState === 'uploading' ? (
                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner />
                        <p className="text-sm text-slate-500 font-medium">Uploading template...</p>
                      </div>
                    ) : uploadState === 'success' ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-700">Template uploaded successfully!</p>
                        <p className="text-xs text-slate-500">Click or drop a new file to replace it.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Drop your HTML file here</p>
                          <p className="text-xs text-slate-400 mt-1">or click to browse · .html files only</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadState === 'error' && uploadError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {uploadError}
                    </p>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ClipboardList,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Layout,
  Power,
  PowerOff,
  ChevronRight,
  Search,
  MoreVertical,
  Settings,
} from "lucide-react";
import { protocolService, categoryService } from "../services";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";
import { FormModal } from "../components/ui/FormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ProtocolForm } from "../components/forms/ProtocolForm";
import { useBreadcrumbs } from "../context/BreadcrumbContext";

export const ProtocolsPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbName } = useBreadcrumbs();

  const [protocols, setProtocols] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusToggleConfirm, setStatusToggleConfirm] = useState(null);

  useEffect(() => {
    fetchData();

    // Check for "add" query param to open form automatically
    const params = new URLSearchParams(location.search);
    if (params.get("add") === "true") {
      handleAdd();
      // Clean up URL to prevent re-opening on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [protocolsRes, categoryRes] = await Promise.all([
        protocolService.getAll({ categoryId }),
        categoryService.getById(categoryId),
      ]);
      setProtocols(protocolsRes.data || []);
      setCategory(categoryRes.data);

      if (categoryRes.data?.name) {
        setBreadcrumbName(categoryId, categoryRes.data.name);
      }
    } catch (error) {
      console.error("Error fetching protocols:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProtocol(null);
    setIsFormOpen(true);
  };

  const handleEdit = (protocol) => {
    setSelectedProtocol(protocol);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedProtocol) {
        await protocolService.update(selectedProtocol._id, formData);
      } else {
        await protocolService.create({ ...formData, categoryId });
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving protocol:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await protocolService.delete(id);
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting protocol:", error);
    }
  };

  const handleToggleStatus = async (protocol) => {
    try {
      await protocolService.update(protocol._id, {
        isActive: !protocol.isActive,
      });
      fetchData();
      setStatusToggleConfirm(null);
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const filteredProtocols = protocols.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/categories")}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {category?.name || "Loading..."} Protocols
              </h1>
              {/* <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-primary-100">
                Protocols
              </span> */}
            </div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 px-6 shadow-primary-200/50"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Protocol</span>
        </button>
      </div>

      {/* Stats/Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search protocols by name..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-xl border border-slate-200/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total:
          </span>
          <span className="text-sm font-bold text-slate-900">
            {filteredProtocols.length}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner />
            <p className="text-slate-400 text-sm font-medium animate-pulse">
              Fetching protocols...
            </p>
          </div>
        ) : filteredProtocols.length === 0 ? (
          <div className="py-20">
            <EmptyState
              icon={ClipboardList}
              title="No protocols found"
              description="Start by creating your first screening protocol for this category"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Protocol Name
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Event Category
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Sex
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Age Group
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProtocols.map((protocol) => (
                  <tr
                    key={protocol._id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {protocol.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {protocol._id.slice(-8).toUpperCase()} • V
                            {protocol.version || 1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {category?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          protocol.sex === "Male"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : protocol.sex === "Female"
                              ? "bg-pink-50 text-pink-600 border border-pink-100"
                              : protocol.sex === "Other"
                                ? "bg-purple-50 text-purple-600 border border-purple-100"
                                : protocol.sex === "Any"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-slate-50 text-slate-600 border border-slate-100"
                        }`}
                      >
                        {protocol.sex || "Any"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">
                        {protocol.minAge || 0}-{protocol.maxAge || 100}{" "}
                        <span className="text-[10px] text-slate-400 font-normal uppercase ml-0.5">
                          Years
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${protocol.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300"}`}
                        />
                        <span
                          className={`text-xs font-bold ${protocol.isActive ? "text-emerald-700" : "text-slate-500"}`}
                        >
                          {protocol.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(protocol)}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                          title="Edit Basic Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/categories/${categoryId}/protocols/${protocol._id}/schema`,
                            )
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all border border-transparent hover:border-primary-100"
                          title="View Schema"
                        >
                          <Layout className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/categories/${categoryId}/protocols/${protocol._id}/report-template`,
                            )
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
                          title="View Report Template"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStatusToggleConfirm(protocol)}
                          className={`p-2 rounded-lg transition-all border border-transparent ${
                            protocol.isActive
                              ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100"
                          }`}
                          title={protocol.isActive ? "Deactivate" : "Activate"}
                        >
                          {protocol.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(protocol)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                          title="Delete Protocol"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProtocol ? "Edit Protocol" : "Add New Protocol"}
      >
        <ProtocolForm
          protocol={selectedProtocol}
          categoryId={categoryId}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          basicOnly={!!selectedProtocol}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Protocol"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone and will affect all related data.`}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        isOpen={!!statusToggleConfirm}
        onClose={() => setStatusToggleConfirm(null)}
        onConfirm={() => handleToggleStatus(statusToggleConfirm)}
        title={
          statusToggleConfirm?.isActive
            ? "Deactivate Protocol"
            : "Activate Protocol"
        }
        message={`Are you sure you want to ${statusToggleConfirm?.isActive ? "deactivate" : "activate"} "${statusToggleConfirm?.name}"?`}
      />
    </div>
  );
};

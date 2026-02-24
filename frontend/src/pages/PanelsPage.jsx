import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Layers, Edit, Trash2 } from "lucide-react";
import { panelService } from "../services";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusToggleSwitch } from "../components/ui/StatusToggleSwitch";
import { FormModal } from "../components/ui/FormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PanelForm } from "../components/forms/PanelForm";

export const PanelsPage = () => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchPanels();
  }, []);

  const updatePanel = async (id) => {
    try {
      const panel = await panelService.getById(id);
      setPanels();
    } catch (error) {
      console.log("Error fetching one single panel", error);
    }
  };

  const fetchPanels = async () => {
    try {
      setLoading(true);
      const response = await panelService.getAll();
      setPanels(response.data.panels || response.data);
    } catch (error) {
      console.error("Error fetching panels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPanel(null);
    setIsFormOpen(true);
  };

  const handleEdit = (panel) => {
    setSelectedPanel(panel);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedPanel) {
        await panelService.update(selectedPanel._id, formData);
      } else {
        await panelService.create(formData);
      }
      setIsFormOpen(false);
      fetchPanels();
    } catch (error) {
      console.error("Error saving panel:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await panelService.delete(id);
      fetchPanels();
    } catch (error) {
      console.error("Error deleting panel:", error);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      await panelService.toggleStatus(id);
      fetchPanels();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredPanels = panels.filter((panel) =>
    panel.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredPanels.length / itemsPerPage);
  const paginatedPanels = filteredPanels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panels</h1>
          <p className="text-slate-600 mt-1">
            {panels?.length || 0} active panels
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Panel
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
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
            {paginatedPanels.map((panel, index) => (
              <motion.div
                key={panel._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium p-6 space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {panel.name}
                  </h3>
                  <StatusToggleSwitch
                    checked={panel.status === "active"}
                    onChange={() => handleStatusToggle(panel._id)}
                  />
                </div>

                <div className="flex items-center -space-x-2">
                  {panel.members?.slice(0, 5).map((member) => (
                    <div
                      key={member._id}
                      className="w-10 h-10 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center font-bold text-primary-700 text-sm"
                      title={member.name}
                    >
                      {getInitials(member.name)}
                    </div>
                  ))}
                  {panel.members?.length > 5 && (
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-medium text-slate-600 text-xs">
                      +{panel.members.length - 5}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {panel.members?.length || 0} member
                    {panel.members?.length !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      panel.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {panel.status?.toUpperCase()}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(panel)}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(panel)}
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
        title={selectedPanel ? "Edit Panel" : "Create New Panel"}
        size="lg"
      >
        <PanelForm
          panel={selectedPanel}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Panel"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

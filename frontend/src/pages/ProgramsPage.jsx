import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Briefcase, Edit, Trash2, ChevronRight } from "lucide-react";
import { programTypeService } from "../services";
import { useAuth } from "../context/AuthContext";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";
import { FormModal } from "../components/ui/FormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ProgramTypeForm } from "../components/forms/ProgramTypeForm";

export const ProgramsPage = () => {
  const [programTypes, setProgramTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgramTypes();
  }, []);

  const fetchProgramTypes = async () => {
    try {
      setLoading(true);
      const res = await programTypeService.getAll();
      setProgramTypes(res.data || []);
    } catch (error) {
      console.error("Error fetching program types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (e, type) => {
    e.stopPropagation();
    setSelectedType(type);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedType) {
        await programTypeService.update(selectedType._id, formData);
      } else {
        await programTypeService.create(formData);
      }
      setIsFormOpen(false);
      fetchProgramTypes();
    } catch (error) {
      console.error("Error saving program type:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await programTypeService.delete(id);
      fetchProgramTypes();
    } catch (error) {
      console.error("Error deleting program type:", error);
    }
  };

  const filteredTypes = programTypes.filter((type) =>
    type.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Program Types</h1>
          <p className="text-slate-600 mt-1">
            {programTypes.length} total program types
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Program Type
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search program types..."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredTypes.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No program types found"
          description="Get started by adding your first program type"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTypes.map((type, index) => (
            <motion.div
              key={type._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/programs/${type._id}/names`)}
              className="card-premium p-5 space-y-4 group cursor-pointer hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/programs/${type._id}/names?add=true`);
                    }}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    title="Add Program"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleEdit(e, type)}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(type);
                    }}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-lg mb-1">
                  {type.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {type.description || "No description provided"}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                <span
                  className={`px-2 py-0.5 rounded-full ${type.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                >
                  {type.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center gap-1 text-primary-600 font-medium">
                  View Programs
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedType ? "Edit Program Type" : "Add Program Type"}
      >
        <ProgramTypeForm
          programType={selectedType}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Program Type"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? All programs under this type will need to be reassigned or will become orphaned.`}
      />
    </div>
  );
};

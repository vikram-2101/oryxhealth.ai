import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Briefcase, Edit, Trash2, ArrowLeft } from "lucide-react";
import { programService, programTypeService } from "../services";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";
import { FormModal } from "../components/ui/FormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ProgramForm } from "../components/forms/ProgramForm";

export const ProgramNamesPage = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [programType, setProgramType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [typeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [programsRes, typeRes] = await Promise.all([
        programService.getAll({ programTypeId: typeId }),
        programTypeService.getById(typeId),
      ]);
      setPrograms(programsRes.data || []);
      setProgramType(typeRes.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProgram(null);
    setIsFormOpen(true);
  };

  const handleEdit = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedProgram) {
        await programService.update(selectedProgram._id, formData);
      } else {
        await programService.create({ ...formData, programTypeId: typeId });
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving program:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await programService.delete(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/programs")}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {programType?.name || "Loading..."}
            </h1>
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              Programs
            </span>
          </div>
          <p className="text-slate-600 mt-1">
            {programs.length} programs available in this type
          </p>
        </div>
        <button 
          onClick={handleAdd}
          className="ml-auto btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search programs..."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredPrograms.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No programs found"
          description="Create your first program for this type"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrograms.map((program, index) => (
            <motion.div
              key={program._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-premium p-5 space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(program)}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    title="Edit Program"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(program)}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete Program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-lg mb-1">
                  {program.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {program.description || "No description provided"}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${program.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                >
                  {program.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  ID: {program._id.slice(-6)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProgram ? "Edit Program" : "Add New Program"}
      >
        <ProgramForm
          program={selectedProgram}
          programTypeId={typeId}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Program"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

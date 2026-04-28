import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Briefcase, Edit, Trash2, ArrowLeft } from "lucide-react";
import { programService, programTypeService } from "../services";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";
import { FormModal } from "../components/ui/FormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ProgramForm } from "../components/forms/ProgramForm";
import { useBreadcrumbs } from "../context/BreadcrumbContext";

export const ProgramNamesPage = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbName } = useBreadcrumbs();
  const [programs, setPrograms] = useState([]);
  const [programType, setProgramType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();

    // Check for "add" query param to open form automatically
    const params = new URLSearchParams(location.search);
    if (params.get("add") === "true") {
      handleAdd();
      // Clean up URL to prevent re-opening on refresh
      navigate(location.pathname, { replace: true });
    }
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

      if (typeRes.data?.name) {
        setBreadcrumbName(typeId, typeRes.data.name);
      }
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
              {programType?.name || "Loading..."} Programs
            </h1>
            {/* <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              Programs
            </span> */}
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Program Name
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Description
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
                {filteredPrograms.map((program) => (
                  <tr
                    key={program._id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {program.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {program._id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-xs truncate">
                      {program.description || "No description provided"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${program.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300"}`}
                        />
                        <span
                          className={`text-xs font-bold ${program.isActive ? "text-emerald-700" : "text-slate-500"}`}
                        >
                          {program.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(program)}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                          title="Edit Program"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(program)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                          title="Delete Program"
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
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProgram ? "Edit Program" : "Add Program"}
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

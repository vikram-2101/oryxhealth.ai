import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FolderTree, Edit, Trash2, ChevronRight } from "lucide-react";
import { categoryService } from "../services";
import { useAuth } from "../context/AuthContext";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";
import { FormModal } from "../components/ui/FormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { CategoryForm } from "../components/forms/CategoryForm";

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (e, category) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCategory) {
        await categoryService.update(selectedCategory._id, formData);
      } else {
        await categoryService.create(formData);
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.delete(id);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-1">
            {categories.length} total categories
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search categories..."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories found"
          description="Get started by adding your first protocol category"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/categories/${category._id}/protocols`)}
              className="card-premium p-5 space-y-4 group cursor-pointer hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/categories/${category.name}/protocols?add=true`,
                      );
                    }}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    title="Add Protocol"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleEdit(e, category)}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(category);
                    }}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-lg mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {category.description || "No description provided"}
                </p>
                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider mt-2">
                  <span
                    className={`px-1.5 py-0.5 rounded border ${
                      category.sex === "Male"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : category.sex === "Female"
                          ? "bg-pink-50 text-pink-600 border-pink-100"
                          : category.sex === "Other"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : category.sex === "Any"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                    }`}
                  >
                    {category.sex || "Any"}
                  </span>
                  {(category.minAge !== undefined ||
                    category.maxAge !== undefined) && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                      Age: {category.minAge || 0}-{category.maxAge || 100} Yrs
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                <span
                  className={`px-2 py-0.5 rounded-full ${category.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center gap-1 text-primary-600 font-medium">
                  View Protocols
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
        title={selectedCategory ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          category={selectedCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm._id)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? All protocols under this category will need to be reassigned or will become orphaned.`}
      />
    </div>
  );
};

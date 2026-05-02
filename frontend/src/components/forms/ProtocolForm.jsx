import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  FileCode2,
} from "lucide-react";
import { AgeRangeSlider } from "../ui/AgeRangeSlider";

export const ProtocolForm = ({
  protocol,
  categoryId,
  onSubmit,
  onCancel,
  basicOnly = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: categoryId || "",
    isActive: true,
    sex: "",
    minAge: 0,
    maxAge: 100,
    reportTemplate: {
      htmlContent: null,
      fileName: null,
    },
  });

  useEffect(() => {
    if (protocol) {
      setFormData({
        name: protocol.name || "",
        categoryId: protocol.categoryId || categoryId || "",
        isActive: protocol.isActive !== undefined ? protocol.isActive : true,
        sex: protocol.sex || "",
        minAge: protocol.minAge !== undefined ? protocol.minAge : 0,
        maxAge: protocol.maxAge !== undefined ? protocol.maxAge : 100,
        reportTemplate: protocol.reportTemplate || {
          htmlContent: null,
          fileName: null,
        },
      });
    }
  }, [protocol, categoryId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      alert("Please upload a valid .html file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        reportTemplate: {
          htmlContent: event.target.result,
          fileName: file.name,
        },
      }));
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Protocol Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter protocol name"
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sex
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Any">Any</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Age Range (Years)
            </label>
            <AgeRangeSlider
              minAge={formData.minAge}
              maxAge={formData.maxAge}
              onChange={(range) =>
                setFormData((prev) => ({ ...prev, ...range }))
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-slate-700"
          >
            Is Active
          </label>
        </div>

        {/* Report Template Upload Section */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <FileCode2 className="w-4 h-4 text-primary-600" />
            HTML Report Template (Optional)
          </h3>

          <div className="flex items-center gap-4">
            <label className="flex-shrink-0 cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-50 hover:border-primary-300 transition-colors">
              <Upload className="w-4 h-4" />
              {formData.reportTemplate?.fileName
                ? "Replace Template"
                : "Upload Template"}
              <input
                type="file"
                accept=".html,.htm"
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </label>

            {formData.reportTemplate?.fileName ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex-1">
                <FileCode2 className="w-4 h-4" />
                <span className="font-semibold truncate">
                  {formData.reportTemplate.fileName}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      reportTemplate: { htmlContent: null, fileName: null },
                    }))
                  }
                  className="ml-auto text-emerald-400 hover:text-emerald-700"
                  title="Remove template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-sm text-slate-400">
                No template uploaded
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary px-6 py-2">
          {protocol ? "Update Protocol" : "Create Protocol"}
        </button>
      </div>
    </form>
  );
};

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormInput } from "../ui/FormInput";
import { FormSelect } from "../ui/FormSelect";
import { institutionService } from "../../services";
import { Upload, X, Edit } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "Doctor", label: "Doctor" },
  { value: "Health Worker", label: "Health Worker" },
  { value: "Coordinator", label: "Coordinator" },
];

const SEX_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    role: user?.role || "",
    sex: user?.sex || "",
    institution: user?.institution?._id || "",
    institutionAccess: user?.institutionAccess?.map((i) => i._id || i) || [],
    registrationNumber: user?.registrationNumber || "",
    specialization: user?.specialization || "",
    designation: user?.designation || "",
    photo: user?.photo || "",
    signatureImage: user?.signatureImage || "",
    password: "",
  });

  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
  const [signaturePreview, setSignaturePreview] = useState(
    user?.signatureImage || null,
  );
  const [institutions, setInstitutions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await institutionService.getAll();

      setInstitutions(response.data.institutions || response.data || []);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.institution) {
      newErrors.institution = "Institution is required";
    }

    // Doctor-specific validation
    if (formData.role === "Doctor") {
      if (!formData.registrationNumber.trim()) {
        newErrors.registrationNumber =
          "Registration number is required for doctors";
      }
      if (!formData.specialization.trim()) {
        newErrors.specialization = "Specialization is required for doctors";
      }
      if (!formData.designation.trim()) {
        newErrors.designation = "Designation is required for doctors";
      }
    }

    // Password validation
    if (!user && !formData.password) {
      newErrors.password = "Password is required for new users";
    } else if (
      formData.password &&
      !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>‎,.?\/\\|`~]).{8,}$/.test(
        formData.password,
      )
    ) {
      newErrors.password =
        "Password must be at least 8 chars, including letters, numbers, and special characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (user && !user._id) {
        throw new Error("User ID is missing. Cannot perform update.");
      }

      // Send as pure JSON
      const payload = { ...formData };

      // Remove empty password on update
      if (user && !payload.password) {
        delete payload.password;
      }

      await onSubmit(payload);
    } catch (error) {
      console.error("Form submission error:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
      }
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while saving the user. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmitError("");

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // If changing primary institution, remove it from additional access
      if (name === "institution" && value) {
        newData.institutionAccess = (prev.institutionAccess || []).filter(
          (id) => id !== value,
        );
      }

      return newData;
    });

    // Clear registration number if role changes from Doctor
    if (name === "role" && value !== "Doctor") {
      setFormData((prev) => ({
        ...prev,
        registrationNumber: "",
        specialization: "",
        designation: "",
      }));
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleInstitutionAccessToggle = (instId) => {
    setFormData((prev) => {
      const currentAccess = prev.institutionAccess || [];
      if (currentAccess.includes(instId)) {
        return {
          ...prev,
          institutionAccess: currentAccess.filter((id) => id !== instId),
        };
      } else {
        return {
          ...prev,
          institutionAccess: [...currentAccess, instId],
        };
      }
    });
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError(
          `${field === "photo" ? "Photo" : "Signature"} size should be less than 2MB`,
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({ ...prev, [field]: base64String }));
        if (field === "photo") setPhotoPreview(base64String);
        if (field === "signatureImage") setSignaturePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const institutionOptions = institutions
    .filter((i) => i.status === "active")
    .map((i) => ({
      value: i._id,
      label: i.name,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium"
        >
          {submitError}
        </motion.div>
      )}

      {/* Profile Photo Section (OryxT Pattern) */}
      <div className="flex flex-col items-center justify-center p-4 border-b border-slate-100 mb-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-primary-400 transition-colors">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <input
            type="file"
            id="user-photo"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "photo")}
          />
          <label
            htmlFor="user-photo"
            className="absolute -bottom-2 -right-2 p-2 bg-primary-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-primary-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </label>
        </div>
        <div className="mt-3 text-center">
          <span className="text-sm font-medium text-slate-900">
            User Profile Photo
          </span>
          <p className="text-xs text-slate-500">JPG, PNG or WebP (Max 2MB)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g., Dr. Alan Hughes"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="e.g., alan@hospital.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
          placeholder="e.g., +1 555-1001"
        />

        <FormInput
          label={
            user ? "New Password (leave blank to keep current)" : "Password"
          }
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required={!user}
          placeholder="Min. 8 chars, 1 letter, 1 number, 1 special char"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={ROLE_OPTIONS}
          error={errors.role}
          required
        />
        <FormSelect
          label="Sex"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          options={SEX_OPTIONS}
          error={errors.sex}
          placeholder="Select sex"
        />
      </div>

      <FormInput
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        required
        placeholder="e.g., 123 Main St, City, State"
      />

      <FormSelect
        label="Primary Institution"
        name="institution"
        value={formData.institution}
        onChange={handleChange}
        options={institutionOptions}
        error={errors.institution}
        required
        placeholder={
          loadingInstitutions
            ? "Loading institutions..."
            : "Select a primary institution"
        }
        disabled={loadingInstitutions}
      />

      {/* Multi-Institution Access */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Additional Institution Access (Optional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50">
          {institutions
            .filter((inst) => inst._id !== formData.institution)
            .map((inst) => (
            <label
              key={inst._id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={formData.institutionAccess.includes(inst._id)}
                onChange={() => handleInstitutionAccessToggle(inst._id)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                {inst.name}
              </span>
            </label>
          ))}
          {institutions.length === 0 && !loadingInstitutions && (
            <p className="text-sm text-slate-400 col-span-2 text-center py-2">
              No institutions available
            </p>
          )}
        </div>
      </div>

      {/* Signature Image Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Digital Signature
        </label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary-500 mb-2 transition-colors" />
                <p className="text-sm text-slate-500 group-hover:text-primary-600">
                  <span className="font-semibold">
                    Click to upload signature
                  </span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG or WebP (Max. 2MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "signatureImage")}
              />
            </label>
          </div>
          {signaturePreview && (
            <div className="relative w-32 h-32 rounded-xl border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-2">
              <img
                src={signaturePreview}
                alt="Signature Preview"
                className="max-w-full max-h-full object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, signatureImage: "" }));
                  setSignaturePreview(null);
                }}
                className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Doctor Fields */}
      {formData.role === "Doctor" && (
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Doctor Information
          </h3>

          <FormInput
            label="Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            error={errors.registrationNumber}
            required
            placeholder="e.g., MD-2024-001"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              error={errors.specialization}
              required
              placeholder="e.g., Cardiology"
            />
            <FormInput
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              error={errors.designation}
              required
              placeholder="e.g., Senior Consultant"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loadingInstitutions}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : user ? "Update User" : "Add User"}
        </button>
      </div>
    </form>
  );
};

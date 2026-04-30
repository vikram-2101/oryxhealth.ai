import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormInput } from "../ui/FormInput";
import { FormSelect } from "../ui/FormSelect";
import { PhoneInput } from "../ui/PhoneInput";
import { institutionService, customerService } from "../../services";
import {
  Upload,
  X,
  Edit,
  MapPin,
  Shield,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../services/api";

const IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");

const ROLE_OPTIONS = [
  { value: "Doctor", label: "Doctor" },
  { value: "Health Worker", label: "Health Worker" },
  { value: "Coordinator", label: "Coordinator" },
];

const ADMIN_OPTIONS = [
  { value: "none", label: "None" },
  { value: "account", label: "Account Admin" },
  { value: "institution", label: "Institution Admin" },
];

const SEX_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export const UserForm = ({ user, onSubmit, onCancel }) => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone?.replace(/^\+\d+/, "") || user?.phone || "",
    phoneCountry: user?.phone?.match(/^\+\d+/)?.[0] || "+91",
    country: user?.country || "India",
    state: user?.state || "",
    city: user?.city || "",
    address: user?.address || "",
    role: user?.role || "",
    admin: user?.admin || "none",
    sex: user?.sex || "",
    accountId:
      user?.accountId?._id ||
      user?.accountId ||
      (!isSuperAdmin ? currentUser?.accountId : ""),
    institution: user?.institution?._id || user?.institution || "",
    institutionAccess: user?.institutionAccess?.map((i) => i._id || i) || [],
    registrationNumber: user?.registrationNumber || "",
    specialization: user?.specialization || "",
    designation: user?.designation || "",
    password: "",
  });

  const [countriesList, setCountriesList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
  const [signaturePreview, setSignaturePreview] = useState(
    user?.signatureImage || null,
  );
  const [customers, setCustomers] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({ photo: null, signatureImage: null });
  const [loadingLists, setLoadingLists] = useState(true);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchLists();
    loadGeoData();
  }, [user]);

  const fetchInstitutionsByAccount = async (accId) => {
    if (!accId) {
      setFilteredInstitutions([]);
      return;
    }
    try {
      // Fetch with a large limit to avoid pagination issues in dropdowns
      const response = await institutionService.getAll({
        accountId: accId,
        limit: 1000,
      });
      setFilteredInstitutions(
        response.data.institutions || response.data || [],
      );
    } catch (error) {
      console.error("Error fetching institutions for account:", error);
    }
  };

  const fetchLists = async () => {
    try {
      setLoadingLists(true);
      const promises = [];

      // If we're editing or have an account selected, fetch its institutions
      const accId =
        formData.accountId || user?.accountId?._id || user?.accountId;
      if (accId) {
        promises.push(
          institutionService.getAll({ accountId: accId, limit: 1000 }),
        );
      } else if (!isSuperAdmin && currentUser?.accountId) {
        promises.push(
          institutionService.getAll({
            accountId: currentUser.accountId,
            limit: 1000,
          }),
        );
      }

      if (isSuperAdmin) {
        promises.push(customerService.getAll());
      }

      const results = await Promise.all(promises);

      if (accId || (!isSuperAdmin && currentUser?.accountId)) {
        const instRes = results[0];
        setFilteredInstitutions(
          instRes.data.institutions || instRes.data || [],
        );

        if (isSuperAdmin) {
          const custRes = results[1];
          setCustomers(custRes.data.customers || custRes.data || []);
        }
      } else if (isSuperAdmin) {
        const custRes = results[0];
        setCustomers(custRes.data.customers || custRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setLoadingLists(false);
    }
  };

  const loadGeoData = () => {
    GetCountries().then((result) => {
      if (!result) return;
      const filtered = result.filter((c) =>
        ["India", "United States", "United Kingdom"].includes(c.name),
      );
      setCountriesList(filtered);

      const countryName = formData.country || "India";
      const country = filtered.find((c) => c.name === countryName);

      if (country) {
        GetState(country.id).then((states) => {
          setStateList(states);
          if (formData.state) {
            const state = states.find((s) => s.name === formData.state);
            if (state) {
              GetCity(country.id, state.id).then((cities) => {
                setCityList(cities);
              });
            }
          }
        });
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.sex) newErrors.sex = "Sex is required";

    if (isSuperAdmin && !formData.accountId) {
      newErrors.accountId = "Customer/Account is required";
    }

    if (!formData.institution)
      newErrors.institution = "Primary institution is required";

    if (formData.role === "Doctor") {
      if (!formData.registrationNumber.trim())
        newErrors.registrationNumber = "Registration number required";
      if (!formData.specialization.trim())
        newErrors.specialization = "Specialization required";
      if (!formData.designation.trim())
        newErrors.designation = "Designation required";
    }

    if (!user && !formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Concat name for backward compatibility if needed, but we now send firstName/lastName
      Object.keys(formData).forEach((key) => {
        if (key === "phone") {
          const fullPhone = `${formData.phoneCountry}${formData.phone}`.replace(/\s+/g, "");
          formDataToSend.append("phone", fullPhone);
        } else if (key === "phoneCountry") {
          // skip
        } else if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key] || "");
        }
      });

      if (files.photo) formDataToSend.append("photo", files.photo);
      else if (
        photoPreview &&
        typeof photoPreview === "string" &&
        photoPreview.startsWith("data:")
      ) {
        formDataToSend.append("photo", photoPreview);
      } else if (!photoPreview && user?.photo) {
        // User explicitly cleared the photo
        formDataToSend.append("photo", "");
      }

      if (files.signatureImage)
        formDataToSend.append("signatureImage", files.signatureImage);
      else if (
        signaturePreview &&
        typeof signaturePreview === "string" &&
        signaturePreview.startsWith("data:")
      ) {
        formDataToSend.append("signatureImage", signaturePreview);
      } else if (!signaturePreview && user?.signatureImage) {
        // User explicitly cleared the signature
        formDataToSend.append("signatureImage", "");
      }

      await onSubmit(formDataToSend);
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "accountId") {
        newData.institution = "";
        newData.institutionAccess = [];
        fetchInstitutionsByAccount(value);
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > (field === "photo" ? 2 : 5) * 1024 * 1024) {
        setSubmitError(
          `File too large. Max ${field === "photo" ? "2MB" : "5MB"}`,
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles((prev) => ({ ...prev, [field]: file }));
        if (field === "photo") setPhotoPreview(reader.result);
        if (field === "signatureImage") setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[85vh] overflow-y-auto px-4 pb-4 scrollbar-thin"
    >
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
          {submitError}
        </div>
      )}

      {/* Section 1: Personal Information */}
      <div className="bg-white rounded-[15px] p-5 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-1">
          Personal Information
        </h3>

        {/* Media: Photo & Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Photo Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Profile Photo (Optional)
            </label>
            <label
              className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${errors.photo ? "border-red-300" : "border-slate-200 hover:border-primary-300 hover:bg-primary-50/30"} rounded-xl cursor-pointer transition-all group overflow-hidden`}
            >
              {photoPreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-2 bg-white">
                  <img
                    src={
                      photoPreview.startsWith("data:")
                        ? photoPreview
                        : `${IMAGE_BASE_URL}${photoPreview}`
                    }
                    alt="Profile Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPhotoPreview(null);
                      setFiles((prev) => ({ ...prev, photo: null }));
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary-500 mb-2 transition-colors" />
                  <p className="text-xs font-medium text-slate-700 group-hover:text-primary-600">
                    Upload photo
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={(e) => handleImageChange(e, "photo")}
              />
            </label>
          </div>

          {/* Signature Image Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Digital Signature (Optional)
            </label>
            <label
              className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${errors.signatureImage ? "border-red-300" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"} rounded-xl cursor-pointer transition-all group overflow-hidden`}
            >
              {signaturePreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-2 bg-white">
                  <img
                    src={
                      signaturePreview.startsWith("data:")
                        ? signaturePreview
                        : `${IMAGE_BASE_URL}${signaturePreview}`
                    }
                    alt="Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSignaturePreview(null);
                      setFiles((prev) => ({ ...prev, signatureImage: null }));
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-full hover:bg-red-200 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-slate-600 mb-2 transition-colors" />
                  <p className="text-xs font-medium text-slate-700 group-hover:text-slate-800">
                    Upload signature
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={(e) => handleImageChange(e, "signatureImage")}
              />
            </label>
          </div>
        </div>

        {/* Row: First Name, Last Name, Sex */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
            placeholder="First Name"
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
            placeholder="Last Name"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sex <span className="text-red-500">*</span>
            </label>
            <div className="flex p-1 bg-slate-100 rounded-[12px] w-full border border-slate-200 shadow-inner h-[46px]">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    handleChange({ target: { name: "sex", value: option } })
                  }
                  className={`flex-1 rounded-[10px] text-xs font-semibold transition-all duration-300 ${
                    formData.sex === option
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.sex && <p className="text-xs text-red-600">{errors.sex}</p>}
          </div>
        </div>
      </div>

      {/* Section 2: User Role Details */}
      <div className="bg-white rounded-[15px] p-5 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-1">
          User Role Details
        </h3>
        <div
          className={`grid grid-cols-1 ${isSuperAdmin ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 items-end`}
        >
          <FormSelect
            label="Professional Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={ROLE_OPTIONS}
            error={errors.role}
            required
            placeholder="Select Role"
          />

          {isSuperAdmin ? (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Account / Customer
              </label>
              <select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                className={`w-full h-[46px] px-4 py-2.5 rounded-xl border transition-all ${
                  errors.accountId
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-300 focus:border-primary-500"
                } focus:outline-none text-sm`}
              >
                <option value="">Select Account</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <p className="text-xs text-red-600">{errors.accountId}</p>
              )}
            </div>
          ) : null}

          <FormSelect
            label="Primary Institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            options={filteredInstitutions.map((i) => ({
              value: i._id,
              label: i.name,
            }))}
            error={errors.institution}
            required
            placeholder={
              !formData.accountId && isSuperAdmin
                ? "Select an account first"
                : "Select Institution"
            }
            disabled={!formData.accountId}
          />
        </div>

        {/* Conditional Doctor Fields */}
        <AnimatePresence>
          {formData.role === "Doctor" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 overflow-hidden"
            >
              <FormInput
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                error={errors.designation}
                required
                placeholder="e.g. Senior Surgeon"
              />
              <FormInput
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                error={errors.registrationNumber}
                required
                placeholder="Medical Reg. Number"
              />
              <FormInput
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                error={errors.specialization}
                required
                placeholder="e.g. Cardiologist"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Access */}
        <AnimatePresence>
          {formData.institution && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-2 border-t border-slate-100"
            >
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                Additional Institution Access
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 border border-slate-200 rounded-2xl bg-slate-50/50 shadow-inner">
                {filteredInstitutions
                  .filter((i) => i._id !== formData.institution)
                  .map((inst) => (
                    <label
                      key={inst._id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200 group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.institutionAccess.includes(inst._id)}
                        onChange={() => {
                          const access = formData.institutionAccess.includes(
                            inst._id,
                          )
                            ? formData.institutionAccess.filter(
                                (id) => id !== inst._id,
                              )
                            : [...formData.institutionAccess, inst._id];
                          setFormData((prev) => ({
                            ...prev,
                            institutionAccess: access,
                          }));
                        }}
                        className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-primary-700">
                        {inst.name}
                      </span>
                    </label>
                  ))}
                {filteredInstitutions.length <= 1 && (
                  <p className="text-sm text-slate-400 col-span-2 text-center py-4 italic">
                    No other institutions available for this account
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section 4: Admin Access */}
      <div className="bg-white rounded-[15px] p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider whitespace-nowrap">
            Admin Portal Access
          </h3>
          <div className="flex-1 max-w-md">
            <div className="flex p-1 bg-slate-100 rounded-[12px] w-full border border-slate-200 shadow-inner h-[50px]">
              {[
                { value: "none", label: "None" },
                { value: "account", label: "Account Admin" },
                { value: "institution", label: "Institution Admin" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: { name: "admin", value: option.value },
                    })
                  }
                  className={`flex-1 rounded-[10px] text-xs font-semibold transition-all duration-300 ${
                    formData.admin === option.value
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 italic px-2">
          Determines if this user can login to the OryxT admin Portal.
        </p>
      </div>

      {/* Section 5: Login Details */}
      <div className="bg-white rounded-[15px] p-5 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-1">
          Login Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhoneInput
            label="Mobile Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            countryCode={formData.phoneCountry}
            onCountryCodeChange={(code) =>
              setFormData((prev) => ({ ...prev, phoneCountry: code }))
            }
            error={errors.phone}
            required
            placeholder="1234567890"
          />
          <FormInput
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="example@email.com"
          />
        </div>
        <FormInput
          label={user ? "New Password (Optional)" : "User Password"}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required={!user}
          placeholder="Min 8 chars, 1 number, 1 special char"
        />
      </div>

      {/* Section 6: Address Information */}
      <div className="bg-white rounded-[15px] p-5 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-1">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={(e) => {
                const country = countriesList.find(
                  (c) => c.name === e.target.value,
                );
                setFormData((prev) => ({
                  ...prev,
                  country: e.target.value,
                  state: "",
                  city: "",
                }));
                if (country) GetState(country.id).then(setStateList);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-sm"
            >
              {countriesList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={(e) => {
                const country = countriesList.find(
                  (c) => c.name === formData.country,
                );
                const state = stateList.find((s) => s.name === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  state: e.target.value,
                  city: "",
                }));
                if (country && state)
                  GetCity(country.id, state.id).then(setCityList);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-sm disabled:opacity-50"
              disabled={!formData.country}
            >
              <option value="">Select State</option>
              {stateList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-sm disabled:opacity-50"
              disabled={!formData.state}
            >
              <option value="">Select City</option>
              {cityList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Address
          </label>
          <textarea
            name="address"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="House, Street, Area..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[10px] focus:outline-none focus:border-primary-500 transition-all resize-none shadow-sm text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-[15px] bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] px-8 py-3 rounded-[15px] bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : user ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
};

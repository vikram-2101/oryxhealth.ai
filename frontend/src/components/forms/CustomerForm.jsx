import { useState, useEffect } from "react";
import { FormInput } from "../ui/FormInput";
import { PhoneInput } from "../ui/PhoneInput";
import { Upload, MapPin, X } from "lucide-react";
import { GetCountries, GetState, GetCity } from "react-country-state-city";

export const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    shortName: customer?.shortName || "",
    welcomeMessage: customer?.welcomeMessage || "",
    tagline: customer?.tagline || "",
    contactName: customer?.contactPerson?.name || "",
    contactEmail: customer?.contactPerson?.email || "",
    contactMobile: customer?.contactPerson?.phone || "",
    contactMobileCountry: customer?.contactPerson?.phoneCountry || "+91",
    country: customer?.address?.country || "India",
    state: customer?.address?.state || "",
    city: customer?.address?.city || "",
    address: customer?.address?.addressLine || "",
    pincode: customer?.address?.pincode || "",
  });

  const [countriesList, setCountriesList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  // Use preview Base64 for the backend to ensure JSON compatibility
  const [files, setFiles] = useState({ logo: null, banner: null });
  const [logoPreview, setLogoPreview] = useState(customer?.logo || null);
  const [bannerPreview, setBannerPreview] = useState(customer?.banner || null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    GetCountries().then((result) => {
      if (!isMounted || !result) return;
      const filtered = result.filter((c) =>
        ["India", "United States", "United Kingdom"].includes(c.name),
      );
      setCountriesList(filtered);

      const countryName = customer?.address?.country || "India";
      const country = filtered.find((c) => c.name === countryName);

      if (country) {
        GetState(country.id).then((states) => {
          if (!isMounted) return;
          setStateList(states);
          if (customer?.address?.state) {
            const state = states.find(
              (s) => s.name === customer?.address?.state,
            );
            if (state) {
              GetCity(country.id, state.id).then((cities) => {
                if (isMounted) setCityList(cities);
              });
            }
          }
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [customer]);

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    const country = countriesList.find((c) => c.name === countryName);

    setFormData((prev) => ({
      ...prev,
      country: countryName,
      state: "",
      city: "",
    }));

    if (country) {
      GetState(country.id).then((states) => {
        setStateList(states);
      });
    } else {
      setStateList([]);
    }
    setCityList([]);
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    const country = countriesList.find((c) => c.name === formData.country);
    const state = stateList.find((s) => s.name === stateName);

    setFormData((prev) => ({
      ...prev,
      state: stateName,
      city: "",
    }));

    if (country && state) {
      GetCity(country.id, state.id).then((cities) => {
        setCityList(cities);
      });
    } else {
      setCityList([]);
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = field === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(
          `${field === "logo" ? "Logo" : "Banner"} size should be less than ${field === "logo" ? "2MB" : "5MB"}`,
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFiles((prev) => ({ ...prev, [field]: file }));
        if (field === "logo") setLogoPreview(base64String);
        if (field === "banner") setBannerPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Account name is required";
    if (!formData.shortName.trim())
      newErrors.shortName = "Short name is required";

    if (!formData.contactName.trim())
      newErrors.contactName = "Contact name is required";
    if (
      formData.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = "Invalid email";
    }
    if (!formData.contactEmail.trim())
      newErrors.contactEmail = "Email is required";
    if (!formData.contactMobile.trim())
      newErrors.contactMobile = "Mobile is required";

    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";

    if (!logoPreview) newErrors.logo = "Logo is required";
    if (!bannerPreview) newErrors.banner = "Banner is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const submitData = {
          name: formData.name,
          shortName: formData.shortName,
          welcomeMessage: formData.welcomeMessage,
          tagline: formData.tagline,
          logo: logoPreview,
          banner: bannerPreview,
          contactPerson: {
            name: formData.contactName,
            email: formData.contactEmail,
            phone: formData.contactMobile,
            phoneCountry: formData.contactMobileCountry,
          },
          address: {
            country: formData.country,
            state: formData.state,
            city: formData.city,
            addressLine: formData.address,
            pincode: formData.pincode,
          },
        };

        await onSubmit(submitData);
      } catch (err) {
        console.error("Form submission error:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
      // Optional: alert first error
      const firstError = Object.values(newErrors)[0];
      if (firstError) alert(firstError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto px-2 pb-4 scrollbar-thin"
    >
      {/* Media Dropzones */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-bold mb-4 text-slate-800">Media</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo Field */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Logo (Required)
              </label>
            </div>
            <label
              className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed ${errors.logo ? "border-red-300" : "border-indigo-200 hover:border-indigo-300"} bg-indigo-50/30 rounded-xl cursor-pointer hover:bg-indigo-50 transition-all group overflow-hidden`}
            >
              {logoPreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-2 bg-white">
                  <img
                    src={logoPreview}
                    alt="Logo text"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLogoPreview(null);
                      setFiles((prev) => ({ ...prev, logo: null }));
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                    Drop file here or click to upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                    PNG, JPEG
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={(e) => handleImageChange(e, "logo")}
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              PNG, JPEG • Max 2MB • 100 x 100 px
            </p>
          </div>

          {/* Banner Field */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Banner (Required)
              </label>
            </div>
            <label
              className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed ${errors.banner ? "border-red-300" : "border-slate-200 hover:border-slate-300"} bg-slate-50/50 rounded-xl cursor-pointer hover:bg-slate-50 transition-all group overflow-hidden`}
            >
              {bannerPreview ? (
                <div className="relative w-full h-full flex items-center justify-center bg-white">
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setBannerPreview(null);
                      setFiles((prev) => ({ ...prev, banner: null }));
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-full hover:bg-red-200 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-slate-600 mb-3 transition-colors" />
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-800">
                    Drop file here or click to upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                    PNG, JPEG
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={(e) => handleImageChange(e, "banner")}
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              PNG, JPEG • Max 5MB • 1200 x 600 px
            </p>
          </div>
        </div>
      </div>
      {/* Account Details */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-bold mb-4 text-slate-800">
          Account Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Account Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
            placeholder="e.g., MedVita Health Systems"
          />
          <FormInput
            label="Short Name"
            name="shortName"
            maxLength="10"
            value={formData.shortName}
            onChange={(e) =>
              setFormData({ ...formData, shortName: e.target.value })
            }
            error={errors.shortName}
            required
            placeholder="e.g., MVH"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Welcome Message"
            name="welcomeMessage"
            maxLength="100"
            value={formData.welcomeMessage}
            onChange={(e) =>
              setFormData({ ...formData, welcomeMessage: e.target.value })
            }
            placeholder="e.g., Welcome to MedVita!"
          />
          <FormInput
            label="Tagline"
            name="tagline"
            maxLength="100"
            value={formData.tagline}
            onChange={(e) =>
              setFormData({ ...formData, tagline: e.target.value })
            }
            placeholder="e.g., Caring for life"
          />
        </div>
      </div>

      {/* Contact Person Details */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-bold mb-4 text-slate-800">
          Contact Person Details
        </h2>
        <div className="space-y-4">
          <FormInput
            label="Full Name"
            name="contactName"
            value={formData.contactName}
            onChange={(e) =>
              setFormData({ ...formData, contactName: e.target.value })
            }
            error={errors.contactName}
            required
            placeholder="e.g., Sarah Chen"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneInput
              label="Mobile Number"
              name="contactMobile"
              value={formData.contactMobile}
              onChange={(e) =>
                setFormData({ ...formData, contactMobile: e.target.value })
              }
              countryCode={formData.contactMobileCountry}
              onCountryCodeChange={(code) =>
                setFormData({ ...formData, contactMobileCountry: code })
              }
              error={errors.contactMobile}
              required
              placeholder="1234567890"
            />
            <FormInput
              label="Email Address"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
              error={errors.contactEmail}
              required
              placeholder="e.g., sarah@medvita.com"
            />
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider">
            Address
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              className={`w-full px-4 py-2.5 bg-white border ${errors.country ? "border-red-300" : "border-slate-300"} rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none`}
            >
              <option value="">
                {countriesList.length === 0
                  ? "Loading countries..."
                  : "Select Country"}
              </option>
              {countriesList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              disabled={!formData.country || stateList.length === 0}
              className={`w-full px-4 py-2.5 bg-white border ${errors.state ? "border-red-300" : "border-slate-300"} rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400`}
            >
              <option value="">
                {formData.country && stateList.length === 0
                  ? "Loading states..."
                  : "Select State"}
              </option>
              {stateList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={!formData.state || cityList.length === 0}
              className={`w-full px-4 py-2.5 bg-white border ${errors.city ? "border-red-300" : "border-slate-300"} rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400`}
            >
              <option value="">
                {formData.state && cityList.length === 0
                  ? "Loading cities..."
                  : "Select City"}
              </option>
              {cityList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Street address, building, apartment..."
          />
          <FormInput
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={(e) =>
              setFormData({ ...formData, pincode: e.target.value })
            }
            placeholder="ZIP / Pincode"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-6 sticky bottom-0 bg-white border-t border-slate-200 mt-6 z-10 py-4 shadow-[0_-10px_10px_-10px_rgba(0,0,0,0.05)]">
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
          disabled={isSubmitting}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Saving..."
            : customer
              ? "Update Customer"
              : "Create Account"}
        </button>
      </div>
    </form>
  );
};

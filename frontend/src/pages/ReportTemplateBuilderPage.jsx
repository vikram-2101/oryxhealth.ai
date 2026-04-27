import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, Reorder } from "framer-motion";
import { 
  ArrowLeft, Save, Eye, Settings, Layout, Layers, 
  ChevronDown, ChevronUp, Check, X, Plus, Trash2,
  Image as ImageIcon, Type, Palette, RefreshCw, AlertCircle
} from "lucide-react";
import { reportTemplateService } from "../services/reportTemplateService";
import { protocolService } from "../services";
import { useToast } from "../context/ToastContext";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useBreadcrumbs } from "../context/BreadcrumbContext";

export const ReportTemplateBuilderPage = () => {
  const { categoryId, protocolId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { setBreadcrumbName } = useBreadcrumbs();

  const [protocol, setProtocol] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("sections"); // sections, styling, preview
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchData();
  }, [protocolId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        protocolService.getById(protocolId),
        reportTemplateService.getTemplateByProtocol(protocolId).catch(() => null)
      ]);

      setProtocol(pRes.data);
      if (pRes.data?.name) {
        setBreadcrumbName(protocolId, pRes.data.name);
      }
      
      if (tRes && tRes.status === "success") {
        setTemplate(tRes.data);
      } else {
        // Template missing, trigger seed
        const seedRes = await reportTemplateService.seedTemplate(protocolId);
        if (seedRes.status === "success") {
          setTemplate(seedRes.data);
          toast.success("Default template seeded successfully");
        }
      }
    } catch (error) {
      console.error("Error fetching template data:", error);
      toast.error("Failed to load template data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await reportTemplateService.updateTemplate(template._id, template);
      toast.success("Template saved successfully");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index, updates) => {
    const newSections = [...template.sections];
    newSections[index] = { ...newSections[index], ...updates };
    setTemplate({ ...template, sections: newSections });
  };

  const updateStyling = (updates) => {
    setTemplate({ ...template, styling: { ...template.styling, ...updates } });
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!template) return <div className="p-10 text-center text-slate-500">Failed to load template.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => navigate(`/categories/${categoryId}/protocols`)}
          className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{protocol?.name}</h1>
          <p className="text-xs text-slate-500">Report Template Builder • V{template.version}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: "sections", icon: Layers, label: "Structure" },
              { id: "styling", icon: Palette, label: "Styling" },
              { id: "preview", icon: Eye, label: "Preview" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 py-2.5"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === "sections" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layout className="w-5 h-5 text-indigo-500" />
                Report Sections
              </h2>
              <button className="text-sm font-semibold text-indigo-600 flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Custom Section
              </button>
            </div>
            
            <div className="space-y-3">
              {template.sections.map((section, idx) => (
                <SectionCard 
                  key={section.sectionKey}
                  section={section}
                  index={idx}
                  isExpanded={expandedSection === idx}
                  onToggle={() => setExpandedSection(expandedSection === idx ? null : idx)}
                  onUpdate={(updates) => updateSection(idx, updates)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "styling" && (
          <StylingPanel styling={template.styling} onUpdate={updateStyling} />
        )}

        {activeTab === "preview" && (
          <div className="bg-slate-100 p-8 rounded-2xl flex justify-center border-2 border-dashed border-slate-300">
            <div className="text-center py-20">
              <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400">Preview Mode</h3>
              <p className="text-slate-400 max-w-xs">
                Real-time preview will be rendered here.
              </p>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>Note: The preview uses the same rendering engine as the clinical application.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({ section, isExpanded, onToggle, onUpdate }) => {
  return (
    <div className={`bg-white border rounded-2xl transition-all ${isExpanded ? "border-indigo-200 shadow-md ring-4 ring-indigo-50" : "border-slate-200"}`}>
      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={onToggle}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.visible ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
          {section.type === "patient_info" && <User className="w-5 h-5" />}
          {section.type === "observations" && <Eye className="w-5 h-5" />}
          {section.type === "findings" && <FileText className="w-5 h-5" />}
          {section.type === "signature" && <Type className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900">{section.title}</h3>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{section.type} • {section.layout}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onUpdate({ visible: !section.visible }); }}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              section.visible ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
            }`}
          >
            {section.visible ? "Visible" : "Hidden"}
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-slate-100 p-5 space-y-6 bg-slate-50/50 rounded-b-2xl"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Section Title</label>
              <input 
                type="text"
                value={section.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layout</label>
              <select 
                value={section.layout}
                onChange={(e) => onUpdate({ layout: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="single-col">Single Column</option>
                <option value="two-col">Two Columns</option>
                <option value="three-col">Three Columns</option>
              </select>
            </div>
          </div>

          {section.fields.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Mapping & Visibility</label>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-bottom border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-600">Field Label</th>
                      <th className="px-4 py-2 font-bold text-slate-600">Type</th>
                      <th className="px-4 py-2 font-bold text-slate-600">Unit</th>
                      <th className="px-4 py-2 text-right font-bold text-slate-600">Visible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {section.fields.map((field, fIdx) => (
                      <tr key={field.fieldKey} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5">
                          <input 
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...section.fields];
                              newFields[fIdx] = { ...field, label: e.target.value };
                              onUpdate({ fields: newFields });
                            }}
                            className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-700 p-0"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                           <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">{field.type}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <input 
                            type="text"
                            value={field.unit || ""}
                            onChange={(e) => {
                              const newFields = [...section.fields];
                              newFields[fIdx] = { ...field, unit: e.target.value };
                              onUpdate({ fields: newFields });
                            }}
                            placeholder="—"
                            className="w-16 bg-transparent border-none focus:ring-0 text-slate-600 p-0"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button 
                            onClick={() => {
                              const newFields = [...section.fields];
                              newFields[fIdx] = { ...field, visible: !field.visible };
                              onUpdate({ fields: newFields });
                            }}
                            className={`p-1 rounded-lg transition-colors ${field.visible ? "text-indigo-600 bg-indigo-50" : "text-slate-300 hover:text-slate-400"}`}
                          >
                            {field.visible ? <Eye className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

const StylingPanel = ({ styling, onUpdate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-500" />
          Color & Typography
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Theme Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color"
                value={styling.primaryColor}
                onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                className="w-12 h-12 rounded-xl cursor-pointer border-none p-0"
              />
              <input 
                type="text"
                value={styling.primaryColor}
                onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font Family</label>
            <select 
              value={styling.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white"
            >
              <option value="Inter, sans-serif">Inter (Modern)</option>
              <option value="'Outfit', sans-serif">Outfit (Round)</option>
              <option value="'Roboto', sans-serif">Roboto (Clean)</option>
              <option value="serif">Classic Serif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-500" />
          Branding Assets
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Show Institutional Banner</p>
              <p className="text-xs text-slate-500">Display the banner at the top of the report</p>
            </div>
            <button 
              onClick={() => onUpdate({ showBanner: !styling.showBanner })}
              className={`w-12 h-6 rounded-full transition-all relative ${styling.showBanner ? "bg-indigo-600" : "bg-slate-300"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${styling.showBanner ? "right-1" : "left-1"}`} />
            </button>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Asset Key</label>
             <input 
                type="text"
                value={styling.bannerAssetKey || ""}
                onChange={(e) => onUpdate({ bannerAssetKey: e.target.value })}
                placeholder="e.g. institution_banner_xyz"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
              />
              <p className="text-[10px] text-slate-400">Leave empty to use the default platform banner.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

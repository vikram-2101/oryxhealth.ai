import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Layout,
  Settings,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { protocolService } from "../services";
import { useToast } from "../context/ToastContext";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useBreadcrumbs } from "../context/BreadcrumbContext";

export const ProtocolSchemaPage = () => {
  const { categoryId, protocolId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { setBreadcrumbName } = useBreadcrumbs();

  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    fetchData();
  }, [protocolId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await protocolService.getById(protocolId);
      setProtocol(res.data);
      if (res.data?.name) {
        setBreadcrumbName(protocolId, res.data.name);
      }
    } catch (error) {
      console.error("Error fetching protocol:", error);
      toast.error("Failed to load protocol data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await protocolService.update(protocolId, protocol);
      toast.success("Form structure saved successfully");
    } catch (error) {
      console.error("Error saving protocol:", error);
      toast.error("Failed to save form structure");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    const nextOrder = (protocol.formStructure?.length || 0) + 1;
    const newStep = {
      stepKey: `step_${nextOrder}`,
      stepLabel: `Step ${nextOrder}`,
      order: nextOrder,
      fields: [],
    };
    setProtocol({
      ...protocol,
      formStructure: [...(protocol.formStructure || []), newStep],
    });
    setActiveStep(protocol.formStructure?.length || 0);
  };

  const handleRemoveStep = (index) => {
    const newStructure = protocol.formStructure.filter((_, i) => i !== index);
    setProtocol({ ...protocol, formStructure: newStructure });
    if (activeStep >= newStructure.length) {
      setActiveStep(Math.max(0, newStructure.length - 1));
    }
  };

  const handleStepChange = (index, field, value) => {
    const newStructure = [...protocol.formStructure];
    newStructure[index] = { ...newStructure[index], [field]: value };
    setProtocol({ ...protocol, formStructure: newStructure });
  };

  const handleAddField = (stepIndex) => {
    const newStructure = [...protocol.formStructure];
    const nextFieldNum = newStructure[stepIndex].fields.length + 1;
    newStructure[stepIndex].fields.push({
      fieldKey: `field_${nextFieldNum}`,
      label: `Field ${nextFieldNum}`,
      type: "text",
      required: false,
      options: [],
    });
    setProtocol({ ...protocol, formStructure: newStructure });
  };

  const handleRemoveField = (stepIndex, fieldIndex) => {
    const newStructure = [...protocol.formStructure];
    newStructure[stepIndex].fields = newStructure[stepIndex].fields.filter(
      (_, i) => i !== fieldIndex,
    );
    setProtocol({ ...protocol, formStructure: newStructure });
  };

  const handleFieldChange = (stepIndex, fieldIndex, field, value) => {
    const newStructure = [...protocol.formStructure];
    newStructure[stepIndex].fields[fieldIndex] = {
      ...newStructure[stepIndex].fields[fieldIndex],
      [field]: value,
    };
    setProtocol({ ...protocol, formStructure: newStructure });
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  if (!protocol)
    return (
      <div className="p-10 text-center text-slate-500">Protocol not found.</div>
    );

  return (
    <div className="max-w-[1460px] mx-auto px-4 space-y-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-[15px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/categories/${categoryId}/protocols`)}
            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {protocol.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Schema Configuration • V{protocol.version || 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 py-2.5 px-8"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Schema</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Steps */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary-600" />
                Form Steps
              </h3>
              <button
                onClick={handleAddStep}
                className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                title="Add Step"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {(protocol.formStructure || []).map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeStep === idx
                      ? "bg-primary-50 text-primary-700 ring-1 ring-primary-100 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      activeStep === idx
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="flex-1 text-left font-semibold text-sm truncate">
                    {step.stepLabel}
                  </span>
                  {activeStep === idx && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStep(idx);
                      }}
                      className="p-1 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </button>
              ))}
              {(protocol.formStructure || []).length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm italic">
                  No steps defined.
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 leading-relaxed">
              <p className="font-bold mb-1">Architecture Note</p>
              Avoid changing field keys if data has already been recorded for
              this protocol version.
            </div>
          </div>
        </div>

        {/* Main Content - Field Editor */}
        <div className="col-span-9">
          {protocol.formStructure && protocol.formStructure[activeStep] ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 space-y-4 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Step Label
                    </label>
                    <input
                      type="text"
                      value={protocol.formStructure[activeStep].stepLabel}
                      onChange={(e) =>
                        handleStepChange(
                          activeStep,
                          "stepLabel",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Step Key
                    </label>
                    <input
                      type="text"
                      value={protocol.formStructure[activeStep].stepKey}
                      onChange={(e) =>
                        handleStepChange(activeStep, "stepKey", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/30 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary-600" />
                    Fields in Step
                  </h3>
                  <button
                    onClick={() => handleAddField(activeStep)}
                    className="text-sm font-bold text-primary-600 flex items-center gap-1.5 hover:bg-primary-50 px-4 py-2 rounded-xl transition-all border border-primary-100"
                  >
                    <Plus className="w-4 h-4" /> Add Field
                  </button>
                </div>

                <div className="space-y-4">
                  {protocol.formStructure[activeStep].fields.map(
                    (field, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm grid grid-cols-12 gap-5 items-start group relative"
                      >
                        <div className="col-span-4 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              handleFieldChange(
                                activeStep,
                                fIdx,
                                "label",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div className="col-span-3 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                            Input Type
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              handleFieldChange(
                                activeStep,
                                fIdx,
                                "type",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 bg-white"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="textarea">Textarea</option>
                            <option value="radio">Radio Group</option>
                            <option value="datetime-local">Date Time</option>
                            <option value="hearing_test_table">
                              Clinical Table
                            </option>
                          </select>
                        </div>
                        <div className="col-span-3 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                            Field Key
                          </label>
                          <input
                            type="text"
                            value={field.fieldKey}
                            onChange={(e) =>
                              handleFieldChange(
                                activeStep,
                                fIdx,
                                "fieldKey",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 font-mono"
                          />
                        </div>
                        <div className="col-span-1 flex flex-col items-center pt-6">
                          <label
                            className="flex flex-col items-center gap-1 cursor-pointer"
                            title="Required"
                          >
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) =>
                                handleFieldChange(
                                  activeStep,
                                  fIdx,
                                  "required",
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded text-primary-600 border-slate-300"
                            />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">
                              Req
                            </span>
                          </label>
                        </div>
                        <div className="col-span-1 flex flex-col items-center pt-6">
                          <button
                            onClick={() => handleRemoveField(activeStep, fIdx)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {field.type === "radio" && (
                          <div className="col-span-12 flex justify-start mt-1">
                            <button className="text-[10px] font-bold text-primary-600 uppercase hover:underline">
                              Manage Options
                            </button>
                          </div>
                        )}
                      </div>
                    ),
                  )}

                  {protocol.formStructure[activeStep].fields.length === 0 && (
                    <div className="py-20 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                      <ClipboardList className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">No fields added to this step.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-20 text-center text-slate-400">
              <Layout className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-sm">
                Select a step or add a new one to start configuration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

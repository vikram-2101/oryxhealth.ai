import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Building,
  Users,
  Layers,
  Activity,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  HeartPulse,
  ClipboardList,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { statsService, userService, customerService } from "../services";
import { useAuth } from "../context/AuthContext";
import { useRef } from "react";
import { AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
};

const PIE_COLORS = [
  "#9165bd", // Brand Purple
  "#10b981", // Emerald
  "#f59e0b", // Amber
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Template panel state
  const [templatePanelOpen, setTemplatePanelOpen] = useState(false);
  const [templateStatus, setTemplateStatus] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [uploadState, setUploadState] = useState("idle");
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const openTemplatePanel = async () => {
    setTemplatePanelOpen(true);
    setUploadState("idle");
    setUploadError("");
    setTemplateLoading(true);
    try {
      const res = await customerService.getById(user.accountId);
      if (res?.data?.reportTemplate) {
        setTemplateStatus(res.data.reportTemplate);
      } else {
        setTemplateStatus(null);
      }
    } catch (err) {
      console.error("Error fetching account template", err);
    } finally {
      setTemplateLoading(false);
    }
  };

  const closeTemplatePanel = () => {
    setTemplatePanelOpen(false);
    setUploadState("idle");
    setUploadError("");
  };

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      setUploadState("error");
      setUploadError("Please upload a valid .html file.");
      return;
    }

    setUploadState("uploading");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const htmlContent = event.target.result;
        const updateData = {
          reportTemplate: {
            htmlContent,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        };
        await customerService.update(user.accountId, updateData);
        setUploadState("success");
        setTemplateStatus(updateData.reportTemplate);
      } catch (err) {
        console.error("Upload failed", err);
        setUploadState("error");
        setUploadError("Upload failed. Please try again.");
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleFileInput = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const TOKENS = [
    "{{protocol_content}}",
    "{{patient_name}}",
    "{{patient_mrn}}",
    "{{patient_age}}",
    "{{patient_sex}}",
    "{{visit_date}}",
    "{{institution_name}}",
    "{{banner_base64}}",
    "{{signature_base64}}",
    "{{generated_by}}",
    "{{generated_by_role}}",
    "{{footer_text}}",
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        statsService.getDashboardStats(),
        userService.getAll(),
      ]);

      // Extract stats - the service returns response.data, which is { success, data }
      const statsData = statsRes?.data || statsRes;
      if (statsData && typeof statsData === "object") {
        setStats(statsData);
      }

      // Extract users - the service returns response.data, which is { success, data, users }
      // The users might be in .data or .users field
      const rawUsers = usersRes?.data || usersRes?.users || usersRes;
      const allUsers = Array.isArray(rawUsers) ? rawUsers : [];
      setRecentUsers(allUsers.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const kpiCards = [
    {
      id: "patients",
      label: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: HeartPulse,
      gradient: "from-blue-500/10 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      path: "#",
      show: !isSuperAdmin,
    },
    {
      id: "events",
      label: "Total Events",
      value: stats?.totalEvents || 0,
      icon: ClipboardList,
      gradient: "from-rose-500/10 to-rose-500/5",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
      path: "#",
      show: !isSuperAdmin,
    },
    {
      id: "customers",
      label: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Building2,
      gradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      path: "/customers",
      show: isSuperAdmin,
    },
    {
      id: "institutions",
      label: "Total Institutions",
      value: stats?.totalInstitutions || 0,
      icon: Building,
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      path: "/institutions",
      show: true,
    },
    {
      id: "users",
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      gradient: "from-violet-500/10 to-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      path: "/users",
      show: true,
    },
    {
      id: "panels",
      label: "Total Panels",
      value: stats?.totalPanels || 0,
      icon: Layers,
      gradient: "from-amber-500/10 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      path: "/panels",
      show: true,
    },
  ].filter((card) => card.show);

  const roleDistribution = [
    { name: "Doctors", value: stats?.usersByRole?.Doctor || 0 },
    {
      name: "Health Workers",
      value: stats?.usersByRole?.["Health Worker"] || 0,
    },
    { name: "Coordinators", value: stats?.usersByRole?.Coordinator || 0 },
  ];

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {stats?.accountName || "Dashboard"}
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome to your dashboard overview.
          </p>
        </div>
        {!isSuperAdmin && user?.role === "account" && (
          <button
            onClick={openTemplatePanel}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Upload Report Template
          </button>
        )}
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4"
      >
        {kpiCards.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{
              y: -5,
              boxShadow: "0 12px 40px -12px rgba(0,0,0,0.15)",
              borderColor: "rgb(var(--primary-200))",
            }}
            transition={{ duration: 0.25 }}
            onClick={() => navigate(s.path)}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer group/card"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${s.gradient} pointer-events-none`}
            />

            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                  {s.label}
                </p>
                <p className="text-3xl font-extrabold text-slate-900 leading-none">
                  {s.value}
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center`}
              >
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Line Chart */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-[15px] border border-slate-200 bg-white p-6 max-w-[850px]"
        >
          <div className="mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isSuperAdmin ? "Account Distribution" : "Patient Distribution"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSuperAdmin
                  ? "Total patients per account"
                  : "Total patients per institution"}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={
                (isSuperAdmin
                  ? stats?.patientsByCustomer
                  : stats?.patientsByInstitution) || []
              }
              layout="vertical"
              margin={{ left: 0, right: 30 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#9165bd" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#9165bd" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradient)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut Chart */}
        <motion.div
          variants={item}
          className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col"
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              User Role Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Across all institutions
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {roleDistribution.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-sm font-bold text-slate-500 ml-1">
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Users Table */}
      <motion.div
        variants={item}
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Recent Users</h2>
          {/* <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                placeholder="Search users…"
                className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-48"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add User
            </button>
          </div> */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left font-medium text-slate-600 px-6 py-3 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left font-medium text-slate-600 px-6 py-3 text-xs uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left font-medium text-slate-600 px-6 py-3 text-xs uppercase tracking-wider">
                  Institution
                </th>
                <th className="text-left font-medium text-slate-600 px-6 py-3 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-xs">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{user.role}</td>
                  <td className="px-6 py-3.5 text-slate-600">
                    {user.institution?.name}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        user.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          user.status === "active"
                            ? "bg-emerald-600"
                            : "bg-red-600"
                        }`}
                      />
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <button className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Report Template Upload Panel ── */}
      <AnimatePresence>
        {templatePanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={closeTemplatePanel}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Report Template
                  </h2>
                </div>
                <button
                  onClick={closeTemplatePanel}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Current Status */}
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Current Template
                  </p>
                  {templateLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <LoadingSpinner />
                      <span>Checking...</span>
                    </div>
                  ) : templateStatus?.fileName ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {templateStatus.fileName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Uploaded{" "}
                          {templateStatus.uploadedAt
                            ? new Date(
                                templateStatus.uploadedAt,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-sm text-slate-600">
                        No template configured yet. Upload one below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Token Reference */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
                    Available Tokens
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TOKENS.map((token, i) => (
                      <span
                        key={i}
                        className="bg-white border border-indigo-100 text-indigo-700 rounded-lg px-2 py-1.5 text-[11px] font-mono truncate"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-indigo-500 mt-3">
                    These tokens will be replaced with dynamic data when
                    generating a report.
                  </p>
                </div>

                {/* Upload Zone */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">
                    Upload HTML Template
                  </p>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() =>
                      uploadState !== "uploading" &&
                      fileInputRef.current?.click()
                    }
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all select-none ${
                      uploadState === "uploading"
                        ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                        : dragOver
                          ? "border-indigo-400 bg-indigo-50 scale-[1.01] cursor-copy"
                          : uploadState === "success"
                            ? "border-emerald-300 bg-emerald-50 cursor-pointer"
                            : uploadState === "error"
                              ? "border-red-300 bg-red-50 cursor-pointer"
                              : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileInput}
                      className="hidden"
                    />

                    {uploadState === "uploading" ? (
                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner />
                        <p className="text-sm text-slate-500 font-medium">
                          Uploading template...
                        </p>
                      </div>
                    ) : uploadState === "success" ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-700">
                          Template uploaded successfully!
                        </p>
                        <p className="text-xs text-slate-500">
                          Click or drop a new file to replace it.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            Drop your HTML file here
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            or click to browse · .html files only
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadState === "error" && uploadError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

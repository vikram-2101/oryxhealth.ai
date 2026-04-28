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
import { statsService, userService } from "../services";
import { useAuth } from "../context/AuthContext";

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
      show: true,
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
      show: true,
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
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 max-w-[850px]"
        >
          <div className="mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Patient Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total patients per institution
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stats?.patientsByInstitution || []}
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
    </motion.div>
  );
};

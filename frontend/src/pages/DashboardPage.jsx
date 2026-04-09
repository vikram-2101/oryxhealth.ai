import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Building,
  Users,
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import {
  LineChart,
  Line,
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
  "hsl(217, 91%, 50%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
];

export const DashboardPage = () => {
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
      setStats(statsRes.data);

      // Get the 5 most recent users
      const allUsers = usersRes.data.users || usersRes.data;
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
      label: "Total Customers",
      value: stats?.totalCustomers || 0,
      change: +12.5,
      sub: "vs last month",
      icon: Building2,
      gradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Total Institutions",
      value: stats?.totalInstitutions || 0,
      change: +8.2,
      sub: "vs last month",
      icon: Building,
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      change: -2.4,
      sub: "vs last month",
      icon: Users,
      gradient: "from-violet-500/10 to-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      label: "Total Panels",
      value: stats?.totalPanels || 0,
      change: +5.0,
      sub: "vs last month",
      icon: Layers,
      gradient: "from-amber-500/10 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
  ];

  const growthData = [
    { month: "Jul", users: 14, institutions: 5 },
    { month: "Aug", users: 18, institutions: 6 },
    { month: "Sep", users: 22, institutions: 7 },
    { month: "Oct", users: 28, institutions: 8 },
    { month: "Nov", users: 34, institutions: 9 },
    { month: "Dec", users: 31, institutions: 10 },
    {
      month: "Jan",
      users: stats?.totalUsers || 38,
      institutions: stats?.totalInstitutions || 12,
    },
  ];

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
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Digital Health System administration overview
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((s) => {
          const isPositive = s.change >= 0;
          return (
            <motion.div
              key={s.label}
              whileHover={{
                y: -3,
                boxShadow: "0 8px 30px -12px rgba(0,0,0,0.12)",
              }}
              transition={{ duration: 0.25 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5"
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
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isPositive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPositive ? "+" : ""}
                      {s.change}%
                    </span>
                    <span className="text-[11px] text-slate-500">{s.sub}</span>
                  </div>
                </div>

                <div
                  className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center`}
                >
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                System Growth
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Users & institutions over time
              </p>
            </div>
            <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option>Last 7 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growthData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
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
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(217, 91%, 50%)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="institutions"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
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
                    <span className="text-xs text-slate-500 ml-1">{value}</span>
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
          <div className="flex items-center gap-2">
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
          </div>
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

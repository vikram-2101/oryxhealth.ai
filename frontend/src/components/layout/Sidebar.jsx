import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Building,
  Users,
  Layers,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FolderTree,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    ];

    if (user?.role === "super_admin") {
      return [
        ...baseItems,
        { icon: Building2, label: "Customers", path: "/customers" },
        { icon: Building, label: "Institutions", path: "/institutions" },
        { icon: Users, label: "Users", path: "/users" },
        { icon: Layers, label: "Panels", path: "/panels" },
        // { icon: Briefcase, label: "Programs", path: "/programs" },
        // { icon: CalendarDays, label: "Appointments", path: "/appointment-types" },
      ];
    }

    if (user?.role === "account") {
      return [
        ...baseItems,
        { icon: Building, label: "Institutions", path: "/institutions" },
        { icon: Users, label: "Users", path: "/users" },
        { icon: Layers, label: "Panels", path: "/panels" },
        { icon: FolderTree, label: "Event Category", path: "/categories" },
        { icon: Briefcase, label: "Program Types", path: "/programs" },
        {
          icon: CalendarDays,
          label: "Appointments",
          path: "/appointment-types",
        },
      ];
    }

    if (user?.role === "institution") {
      return [
        ...baseItems,
        { icon: Users, label: "Users", path: "/users" },
        { icon: Layers, label: "Panels", path: "/panels" },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const getRoleLabel = () => {
    switch (user?.role) {
      case "super_admin":
        return "Super Admin";
      case "account":
        return "Account Admin";
      case "institution":
        return "Institution Admin";
      default:
        return "Admin";
    }
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 256 }}
      className="glass h-screen sticky top-0 border-r border-white/20 flex flex-col"
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <NavLink to="/" className="flex items-center ml-10">
            <img
              src={logo}
              alt="OryxT Health"
              className="h-20 w-auto object-contain"
            />
          </NavLink>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-200/50"
                  : "text-slate-600 hover:bg-white/50"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {getRoleLabel()}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Building,
  Users,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Building2, label: "Customers", path: "/customers" },
    { icon: Building, label: "Institutions", path: "/institutions" },
    { icon: Users, label: "Users", path: "/users" },
    { icon: Layers, label: "Panels", path: "/panels" },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 256 }}
      className="glass h-screen sticky top-0 border-r border-white/20 flex flex-col"
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gradient">OryxTHealth.ai</h1>
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
                  ? "bg-primary-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-white/50"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                Super Admin
              </p>
              <p className="text-xs text-slate-500 truncate">
                admin@oxyhealth.ai
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Building, Users, Layers, TrendingUp } from 'lucide-react';
import { statsService } from '../services';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
    },
    {
      title: 'Total Institutions',
      value: stats?.totalInstitutions || 0,
      icon: Building,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+8%',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+15%',
    },
    {
      title: 'Total Panels',
      value: stats?.totalPanels || 0,
      icon: Layers,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: '+5%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome to OxyHealth.ai Admin Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-premium-hover p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>{card.change}</span>
              </div>
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="card-premium p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left">
            <Building2 className="w-8 h-8 text-slate-400 mb-2" />
            <h3 className="font-semibold text-slate-900">Add Customer</h3>
            <p className="text-sm text-slate-500">Create a new customer account</p>
          </button>
          <button className="p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left">
            <Building className="w-8 h-8 text-slate-400 mb-2" />
            <h3 className="font-semibold text-slate-900">Add Institution</h3>
            <p className="text-sm text-slate-500">Register a new institution</p>
          </button>
          <button className="p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left">
            <Users className="w-8 h-8 text-slate-400 mb-2" />
            <h3 className="font-semibold text-slate-900">Add User</h3>
            <p className="text-sm text-slate-500">Create a new user profile</p>
          </button>
        </div>
      </div>
    </div>
  );
};

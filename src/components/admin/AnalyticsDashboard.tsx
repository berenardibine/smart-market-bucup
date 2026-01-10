import { useState, useEffect } from "react";
import { 
  TrendingUp, Users, Package, Store, Eye, ShoppingBag,
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

const AnalyticsDashboard = () => {
  const { stats, loading } = useAdminStats();
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock chart data for demo
    const generateChartData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map(day => ({
        name: day,
        users: Math.floor(Math.random() * 50) + 10,
        products: Math.floor(Math.random() * 30) + 5,
        visits: Math.floor(Math.random() * 200) + 50,
      }));
    };

    const generateCategoryData = () => [
      { name: 'General', count: Math.floor(Math.random() * 100) + 20, fill: '#f97316' },
      { name: 'Asset', count: Math.floor(Math.random() * 80) + 15, fill: '#3b82f6' },
      { name: 'Agriculture', count: Math.floor(Math.random() * 60) + 10, fill: '#22c55e' },
      { name: 'Rent', count: Math.floor(Math.random() * 40) + 5, fill: '#a855f7' },
      { name: 'Electronics', count: Math.floor(Math.random() * 50) + 8, fill: '#06b6d4' },
    ];

    setChartData(generateChartData());
    setCategoryData(generateCategoryData());
  }, []);

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers,
      change: "+12%",
      changeType: "up",
      color: "bg-blue-500",
    },
    {
      icon: Package,
      label: "Products",
      value: stats.totalProducts,
      change: "+8%",
      changeType: "up",
      color: "bg-orange-500",
    },
    {
      icon: Store,
      label: "Active Shops",
      value: stats.totalShops,
      change: "+5%",
      changeType: "up",
      color: "bg-green-500",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: "12.5K",
      change: "+23%",
      changeType: "up",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          statCards.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.changeType === 'up' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.changeType === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-5 border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">User Growth</h3>
              <p className="text-sm text-muted-foreground">Weekly new registrations</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Website Visits */}
        <div className="bg-white rounded-2xl p-5 border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Website Visits</h3>
              <p className="text-sm text-muted-foreground">Daily visitors this week</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <Activity className="h-4 w-4" />
              Live
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl p-5 border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Products by Category</h3>
            <p className="text-sm text-muted-foreground">Distribution across categories</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }} 
              />
              <Bar 
                dataKey="count" 
                radius={[0, 4, 4, 0]}
                fill="#f97316"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
          <ShoppingBag className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.totalRequests}</p>
          <p className="text-sm opacity-80">Total Requests</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
          <Activity className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">89%</p>
          <p className="text-sm opacity-80">Active Rate</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-5 text-white">
          <TrendingUp className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">+24%</p>
          <p className="text-sm opacity-80">Growth Rate</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white">
          <Eye className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.pendingRequests}</p>
          <p className="text-sm opacity-80">Pending</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

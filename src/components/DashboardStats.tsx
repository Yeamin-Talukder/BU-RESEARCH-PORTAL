import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Users, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { user } = useAuth();
  const [animatedValues, setAnimatedValues] = useState<{ [key: number]: number }>({});

  // Custom content based on Role Requirements
  const getStats = () => {
    if (!user || !user.roles) return [];

    // Determine primary role for dashboard view
    const roles = user.roles as any[];
    let primaryRole = 'Author';

    if (roles.includes('Admin') || roles.includes('Super Admin')) primaryRole = 'Admin';
    else if (roles.includes('Editor') || roles.includes('Associate Editor') || roles.includes('Editor-in-Chief')) primaryRole = 'Editor';
    else if (roles.includes('Reviewer')) primaryRole = 'Reviewer'; // Assuming Reviewer specific stats exists or fallback

    switch (primaryRole) {
      case 'Author':
        return [
          {
            label: 'My Submissions',
            value: '3',
            icon: FileText,
            bgGradient: 'from-blue-50 to-blue-100',
            iconColor: 'from-blue-500 to-blue-600',
            trend: '+2 this month',
            trendUp: true,
          },
          {
            label: 'Pending Reviews',
            value: '1',
            icon: Clock,
            bgGradient: 'from-amber-50 to-amber-100',
            iconColor: 'from-amber-500 to-amber-600',
            trend: 'Awaiting feedback',
            trendUp: false,
          },
          {
            label: 'Published',
            value: '5',
            icon: CheckCircle,
            bgGradient: 'from-green-50 to-green-100',
            iconColor: 'from-green-500 to-green-600',
            trend: '+1 this year',
            trendUp: true,
          },
        ];
      case 'Editor':
        return [
          {
            label: 'Papers Assigned',
            value: '12',
            icon: FileText,
            bgGradient: 'from-blue-50 to-blue-100',
            iconColor: 'from-blue-500 to-blue-600',
            trend: '+3 pending',
            trendUp: true,
          },
          {
            label: 'Pending Decisions',
            value: '4',
            icon: AlertCircle,
            bgGradient: 'from-red-50 to-red-100',
            iconColor: 'from-red-500 to-red-600',
            trend: 'Action needed',
            trendUp: false,
          },
          {
            label: 'Active Reviewers',
            value: '8',
            icon: Users,
            bgGradient: 'from-blue-50 to-blue-100',
            iconColor: 'from-blue-500 to-blue-600',
            trend: '2 new this week',
            trendUp: true,
          },
        ];
      case 'Admin':
        return [
          {
            label: 'Total Users',
            value: '1,204',
            icon: Users,
            bgGradient: 'from-blue-50 to-blue-100',
            iconColor: 'from-blue-500 to-blue-600',
            trend: '+45 new users',
            trendUp: true,
          },
          {
            label: 'System Health',
            value: '99%',
            icon: CheckCircle,
            bgGradient: 'from-emerald-50 to-emerald-100',
            iconColor: 'from-emerald-500 to-emerald-600',
            trend: 'Optimal',
            trendUp: true,
          },
          {
            label: 'Pending Approvals',
            value: '7',
            icon: AlertCircle,
            bgGradient: 'from-rose-50 to-rose-100',
            iconColor: 'from-rose-500 to-rose-600',
            trend: 'Critical',
            trendUp: false,
          },
        ];
      default:
        return [];
    }
  };

  // Get time-based greeting - computed directly, no state needed
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Animate numbers on mount
  useEffect(() => {
    if (!user) return;

    const stats = getStats();
    const intervals: ReturnType<typeof setInterval>[] = [];

    stats.forEach((stat, idx) => {
      const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ''));
      const interval = setInterval(() => {
        setAnimatedValues((prev) => {
          const updated = { ...prev };
          updated[idx] = Math.min((updated[idx] || 0) + Math.ceil(numericValue / 20), numericValue);
          return updated;
        });
      }, 50);
      intervals.push(interval);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [user]);

  if (!user) return null;

  const stats = getStats();

  return (
    <div className="relative overflow-hidden bg-slate-50 px-4 py-12 md:py-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            {getTimeGreeting()}, {user.name}! 👋
          </h2>
          <p className="text-slate-600 text-lg md:text-xl">
            Here's your <span className="font-semibold text-slate-700">{user.roles?.[0] || 'User'}</span> dashboard overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const displayValue = animatedValues[idx] !== undefined ? animatedValues[idx] : parseInt(stat.value.replace(/[^0-9]/g, ''));
            const isPercent = stat.value.includes('%');

            return (
              <div
                key={idx}
                className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Content */}
                <div className="relative p-6 md:p-8">
                  {/* Top section: Icon and Trend */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3 md:p-4 rounded-xl bg-gradient-to-br ${stat.bgGradient} group-hover:shadow-lg transition-all duration-300`}>
                      <Icon className={`w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r ${stat.iconColor} bg-clip-text text-transparent`} />
                    </div>

                    {/* Trend Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${stat.trendUp
                      ? 'bg-green-100/80 text-green-700 group-hover:bg-green-200/80'
                      : 'bg-amber-100/80 text-amber-700 group-hover:bg-amber-200/80'
                      }`}>
                      {stat.trendUp ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{stat.trend}</span>
                    </div>
                  </div>

                  {/* Label and Value */}
                  <p className="text-sm md:text-base text-slate-600 font-medium mb-2 group-hover:text-slate-700 transition-colors">
                    {stat.label}
                  </p>

                  <div className="mb-6">
                    <p className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.iconColor} bg-clip-text text-transparent transition-all duration-300`}>
                      {displayValue}
                      {isPercent && '%'}
                    </p>
                  </div>

                  {/* Hover Action Button */}
                  <button className={`w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-gradient-to-r ${stat.iconColor} text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-lg transform group-hover:translate-y-0 translate-y-2 active:scale-95`}>
                    View Details →
                  </button>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="mt-12 p-6 md:p-8 bg-slate-900 rounded-2xl text-white shadow-xl border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <p className="text-slate-400 text-sm mb-2">Last Updated</p>
              <p className="text-lg md:text-xl font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-center border-t md:border-t-0 md:border-l md:border-r border-slate-700 pt-4 md:pt-0">
              <p className="text-slate-400 text-sm mb-2">Account Status</p>
              <p className="text-lg md:text-xl font-semibold text-green-400 flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Active
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-slate-400 text-sm mb-2">Next Review</p>
              <p className="text-lg md:text-xl font-semibold">In 5 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
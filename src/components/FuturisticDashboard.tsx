'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiUserCheck, 
  FiMessageSquare, 
  FiTrendingUp,
  FiActivity,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiPlay
} from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
} from 'chart.js';
import api from '../lib/api';
import { DashboardStats, ChartData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
);

const FuturisticDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    active_users: 0,
    total_groups: 0,
    total_messages: 0,
    growth_rate: 0,
    peak_usage: 0
  });
  const [chartData, setChartData] = useState<{
    media: ChartData;
    messages: ChartData;
    usage: ChartData;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, chartsResponse, usageResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts'),
        api.get('/dashboard/usage')
      ]);

      setStats(statsResponse.data);
      setChartData({
        media: chartsResponse.data.media,
        messages: chartsResponse.data.messages,
        usage: usageResponse.data
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const refreshMediaChart = async () => {
    try {
      const chartsResponse = await api.get('/dashboard/charts');
      if (chartData) {
        setChartData({
          ...chartData,
          media: chartsResponse.data.media
        });
      }
    } catch (error) {
      console.error('Error refreshing media chart:', error);
    }
  };

  const refreshMessageChart = async () => {
    try {
      const chartsResponse = await api.get('/dashboard/charts');
      if (chartData) {
        setChartData({
          ...chartData,
          messages: chartsResponse.data.messages
        });
      }
    } catch (error) {
      console.error('Error refreshing message chart:', error);
    }
  };

  const refreshUsageChart = async () => {
    try {
      const usageResponse = await api.get('/dashboard/usage');
      if (chartData) {
        setChartData({
          ...chartData,
          usage: usageResponse.data
        });
      }
    } catch (error) {
      console.error('Error refreshing usage chart:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      change: stats.growth_rate ? `+${stats.growth_rate}%` : '+12%',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: stats.active_users,
      icon: FiUserCheck,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Groups',
      value: stats.total_groups,
      icon: FiUsers,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Total Messages',
      value: stats.total_messages,
      icon: FiMessageSquare,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      change: '+25%',
      trend: 'up'
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: '#374151'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: '#374151'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <IconComponent className="text-xl text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    {card.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
                    {card.change}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
                  <p className="text-2xl font-bold text-white">{(card.value ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Media Distribution</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <FiEye className="text-sm" />
                <span className="text-sm">Live data</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={refreshMediaChart}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Refresh media chart"
              >
                <FiRefreshCw className="text-sm" />
              </motion.button>
            </div>
          </div>
          <div className="h-80">
            {chartData?.media && (
              <Doughnut
                data={{
                  labels: ['Images', 'Videos', 'Voice', 'Documents'],
                  datasets: [{
                    data: chartData.media.data,
                    backgroundColor: [
                      'rgba(236, 72, 153, 0.8)',
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                      'rgba(236, 72, 153, 1)',
                      'rgba(59, 130, 246, 1)',
                      'rgba(245, 158, 11, 1)',
                      'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2
                  }]
                }}
                options={doughnutOptions}
              />
            )}
          </div>
        </motion.div>

        {/* Message Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Message Analytics</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <FiActivity className="text-sm" />
                <span className="text-sm">7 days</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={refreshMessageChart}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Refresh message chart"
              >
                <FiRefreshCw className="text-sm" />
              </motion.button>
            </div>
          </div>
          <div className="h-80">
            <Bar
              data={{
                labels: chartData?.messages?.labels || [],
                datasets: [
                  {
                    label: 'Single Chat',
                    data: chartData?.messages?.single_data || chartData?.messages?.data || [],
                    backgroundColor: 'rgba(147, 51, 234, 0.8)',
                    borderColor: 'rgba(147, 51, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                  },
                  {
                    label: 'Group Chat',
                    data: chartData?.messages?.group_data || chartData?.messages?.data?.map((d: number) => d * 0.7) || [],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </motion.div>
      </div>

      {/* Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">App Usage Patterns</h3>
            <p className="text-gray-400 text-sm">Day vs Night usage analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <FiTrendingUp className="text-sm" />
              <span className="text-sm">Monthly</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={refreshUsageChart}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Refresh usage chart"
            >
              <FiRefreshCw className="text-sm" />
            </motion.button>
          </div>
        </div>
        <div className="h-96">
          <Line
            data={{
              labels: chartData?.usage?.labels || [],
              datasets: [
                {
                  label: 'Day Time Usage',
                  data: chartData?.usage?.daytime || chartData?.usage?.data || [],
                  borderColor: 'rgba(34, 197, 94, 1)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.3,
                  pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                },
                {
                  label: 'Night Time Usage',
                  data: chartData?.usage?.nighttime || chartData?.usage?.data?.map((d: number) => d * 0.6) || [],
                  borderColor: 'rgba(239, 68, 68, 1)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.3,
                  pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                }
              ]
            }}
            options={{
              ...chartOptions,
              interaction: {
                intersect: false,
                mode: 'index',
              },
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: true,
                  text: 'App Usage Patterns',
                  color: '#e2e8f0'
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: '#ffffff',
                  bodyColor: '#e2e8f0',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                }
              },
              scales: {
                x: {
                  ...chartOptions.scales.x,
                  title: {
                    display: true,
                    text: 'Months',
                    color: '#94a3b8'
                  }
                },
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Messages',
                    color: '#94a3b8'
                  },
                  ticks: {
                    color: '#94a3b8',
                    callback: function(value: number | string) {
                      return Number(value).toLocaleString();
                    }
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: 'User Management', icon: FiUsers, color: 'from-blue-500 to-cyan-500', href: '/admin/users' },
          { title: 'Chat Monitoring', icon: FiMessageSquare, color: 'from-green-500 to-emerald-500', href: '/admin/chats' },
          { title: 'Group Management', icon: FiUsers, color: 'from-purple-500 to-violet-500', href: '/admin/groups' }
        ].map((action) => {
          const IconComponent = action.icon;
          return (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = action.href}
              className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group text-left"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4`}>
                <IconComponent className="text-white text-xl" />
              </div>
              <h4 className="text-white font-semibold mb-2">{action.title}</h4>
              <p className="text-gray-400 text-sm">Quick access to {action.title.toLowerCase()}</p>
              <div className="flex items-center mt-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                <FiPlay className="text-sm mr-2" />
                <span className="text-sm">Open</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Floating Refresh All Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={refreshData}
        disabled={refreshing}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
        title="Refresh all dashboard data"
      >
        <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
        <span className="font-medium">Refresh All</span>
      </motion.button>
    </div>
  );
};

export default FuturisticDashboard;

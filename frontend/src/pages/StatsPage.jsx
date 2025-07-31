import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Brain, Heart, Award } from 'lucide-react';
import { getJournalStats } from '../services/journalService';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const journalStats = await getJournalStats(timeRange);
        setStats(journalStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Mock data for development
        setStats({
          totalEntries: 15,
          currentStreak: 5,
          longestStreak: 12,
          averageMood: 7.2,
          moodTrend: [
            { date: '2024-01-01', mood: 6 },
            { date: '2024-01-02', mood: 7 },
            { date: '2024-01-03', mood: 5 },
            { date: '2024-01-04', mood: 8 },
            { date: '2024-01-05', mood: 7 },
            { date: '2024-01-06', mood: 9 },
            { date: '2024-01-07', mood: 8 },
          ],
          moodDistribution: [
            { name: 'Happy', value: 35, color: '#10B981' },
            { name: 'Calm', value: 25, color: '#3B82F6' },
            { name: 'Grateful', value: 20, color: '#8B5CF6' },
            { name: 'Stressed', value: 15, color: '#F59E0B' },
            { name: 'Sad', value: 5, color: '#EF4444' },
          ],
          weeklyReflection: "This week showed great emotional balance with a positive trend. You've been consistently grateful and maintaining good mental wellness habits."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">
          Your Journey Stats 📊
        </h1>
        <p className="text-gray-600">
          Insights into your emotional well-being and journaling habits
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div 
        className="glass-card p-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex justify-center space-x-2">
          {['week', 'month', 'year'].map((range) => (
            <motion.button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === range 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-primary-600">
                {stats.totalEntries}
              </p>
            </div>
            <Calendar className="text-primary-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-green-600 streak-animation">
                {stats.currentStreak} days
              </p>
            </div>
            <Award className="text-green-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Longest Streak</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.longestStreak} days
              </p>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Mood</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.averageMood}/10
              </p>
            </div>
            <Heart className="text-yellow-500" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mood Trend Chart */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Mood Trend Over Time
          </h3>
          {stats.moodTrend && stats.moodTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.moodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  domain={[0, 10]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Mood Trend Data</h4>
              <p className="text-gray-500 text-sm max-w-xs">
                Keep journaling daily to track your mood patterns over time. Your emotional journey will be visualized here.
              </p>
            </div>
          )}
        </motion.div>

        {/* Mood Distribution Pie Chart */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Mood Distribution
          </h3>
          {stats.moodDistribution && stats.moodDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.moodDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Mood Data Available</h4>
              <p className="text-gray-500 text-sm max-w-xs">
                Start journaling to see your mood distribution patterns. Your emotional insights will appear here once you have entries.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Weekly Reflection */}
      <motion.div 
        className="glass-card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="flex items-center mb-4">
          <Brain className="text-purple-500 mr-3" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">
            AI Weekly Reflection
          </h3>
        </div>
        {stats.weeklyReflection ? (
          <p className="text-gray-700 leading-relaxed">
            {stats.weeklyReflection}
          </p>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Brain className="w-12 h-12 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Reflection Available</h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Complete more journal entries to receive AI-powered insights about your emotional patterns and mental wellness journey.
            </p>
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      <motion.div 
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        {stats.totalEntries > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h4 className="font-semibold text-gray-800">Consistency Champion</h4>
              <p className="text-sm text-gray-600 mt-1">{stats.currentStreak} days in a row!</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-2">🌟</div>
              <h4 className="font-semibold text-gray-800">Positive Mindset</h4>
              <p className="text-sm text-gray-600 mt-1">Keep up the great work!</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-2">📝</div>
              <h4 className="font-semibold text-gray-800">Prolific Writer</h4>
              <p className="text-sm text-gray-600 mt-1">{stats.totalEntries} entries recorded</p>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Achievements Yet</h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Start your journaling journey to unlock achievements and track your progress. Your first entry will begin building your stats!
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StatsPage;

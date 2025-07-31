import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Heart, Brain, Search, Filter, Trash2 } from 'lucide-react';
import { getAllJournals, deleteJournal } from '../services/journalService';
import { format, isToday, isYesterday } from 'date-fns';

const DiaryPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const journalEntries = await getAllJournals();
        setEntries(journalEntries);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
        // Show empty state for new users or when backend is unavailable
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const getMoodEmoji = (mood) => {
    const moodMap = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      grateful: '🙏',
      excited: '🎉',
      calm: '😌',
      stressed: '😤',
      thoughtful: '🤔',
      content: '😊',
      overwhelmed: '😵‍💫'
    };
    return moodMap[mood?.toLowerCase()] || '🌟';
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      setDeletingEntry(entryId);
      await deleteJournal(entryId);
      
      // Remove the entry from the local state
      setEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
      setShowDeleteConfirm(null);
      
      // If the deleted entry was expanded, collapse it
      if (expandedEntry === entryId) {
        setExpandedEntry(null);
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setDeletingEntry(null);
    }
  };

  const confirmDelete = (entryId) => {
    setShowDeleteConfirm(entryId);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const moods = ['all', ...new Set(entries.map(entry => entry.mood))];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your diary...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-8"
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
          My Diary 📖
        </h1>
        <p className="text-gray-600">
          Your personal journey through thoughts and emotions
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="glass-card p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent capitalize"
            >
              {moods.map(mood => (
                <option key={mood} value={mood}>
                  {mood === 'all' ? 'All Moods' : mood}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Entries */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredEntries.map((entry, index) => (
            <motion.div
              key={entry._id}
              className="glass-card p-6 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.01, y: -2 }}
              onClick={() => setExpandedEntry(expandedEntry === entry._id ? null : entry._id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-gray-500" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {getDateLabel(entry.date)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(entry.date), 'h:mm a')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                  <span className="text-sm text-gray-600 capitalize">
                    {entry.mood}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(entry._id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={deletingEntry === entry._id}
                  >
                    {deletingEntry === entry._id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {expandedEntry === entry._id 
                    ? entry.text 
                    : `${entry.text.substring(0, 200)}${entry.text.length > 200 ? '...' : ''}`
                  }
                </p>
              </div>

              <AnimatePresence>
                {expandedEntry === entry._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/20 pt-4"
                  >
                    {entry.summary && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Brain className="text-purple-500 mr-2" size={16} />
                          <span className="text-sm font-semibold text-gray-700">AI Summary</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-white/20 p-3 rounded-lg">
                          {entry.summary}
                        </p>
                      </div>
                    )}

                    {entry.suggestions && entry.suggestions.length > 0 && (
                      <div>
                        <div className="flex items-center mb-2">
                          <Heart className="text-red-500 mr-2" size={16} />
                          <span className="text-sm font-semibold text-gray-700">Suggestions</span>
                        </div>
                        <div className="space-y-2">
                          {entry.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="text-sm text-gray-600 bg-white/20 p-2 rounded">
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-xs text-gray-400 text-right mt-2">
                Click to {expandedEntry === entry._id ? 'collapse' : 'expand'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <motion.div 
            className="glass-card p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-600">
              {searchTerm || selectedMood !== 'all' 
                ? 'No entries match your filters. Try adjusting your search or mood filter.'
                : 'No journal entries yet. Start writing your first entry!'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDelete}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <Trash2 className="text-red-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">
                  Delete Journal Entry
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this journal entry? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEntry(showDeleteConfirm)}
                  disabled={deletingEntry === showDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deletingEntry === showDeleteConfirm ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiaryPage;

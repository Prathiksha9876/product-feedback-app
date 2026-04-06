import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ChevronUp, MessageSquare, Tag, Clock, Star } from 'lucide-react';

const Home = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { user } = useContext(AuthContext);

  const fetchFeedback = async () => {
    try {
      const { data } = await api.get('/feedback');
      setFeedbackList(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleVote = async (id, e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to vote');
      return;
    }
    try {
      await api.put(`/feedback/${id}/vote`);
      fetchFeedback(); // Refresh list to get updated votes/score
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planned': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-600 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-600 border-slate-500/30';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-600';
      case 'Negative': return 'text-red-600';
      case 'Neutral': return 'text-slate-500';
      default: return 'text-slate-500';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return isNaN(d) ? 'Unknown date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const categories = ['All', 'Bug', 'Feature Request', 'Improvement'];
  const filteredList = filter === 'All' ? feedbackList : feedbackList.filter(f => f.category === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Product Feedback
          </h1>
          <p className="text-slate-600 mt-2">Help us shape the future of our product</p>
        </div>
        
        <div className="flex gap-2 p-1 glass rounded-xl overflow-x-auto w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === cat 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl">
          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          {!user ? (
            <>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Login Required</h3>
              <p className="text-slate-600">Please log in to view or submit feedback.</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-slate-800 mb-2">No feedback yet</h3>
              <p className="text-slate-600">Be the first to share your thoughts!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredList.map((feedback) => (
            <Link 
              to={`/feedback/${feedback._id}`} 
              key={feedback._id}
              className="glass p-5 rounded-2xl hover:border-slate-300 transition-all hover:shadow-lg hover:-translate-y-1 group flex gap-5"
            >
              {/* Vote Button */}
              <button 
                onClick={(e) => handleVote(feedback._id, e)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[60px] h-fit border transition-colors ${
                  user && feedback.upvotes?.includes(user._id)
                    ? 'bg-purple-100 border-purple-200 text-purple-700'
                    : 'bg-white/80 border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <ChevronUp className="w-6 h-6 -mb-1" />
                <span className="font-bold text-lg">{feedback.upvotes?.length || 0}</span>
              </button>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-400 transition-colors truncate">
                      {feedback.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < (feedback.rating || 0) ? 'currentColor' : 'none'} className={i < (feedback.rating || 0) ? '' : 'text-slate-300'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                    {user?.role === 'admin' && feedback.priority && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority} Priority
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-slate-600 line-clamp-2 text-sm mb-4">
                  {feedback.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-md border border-slate-200/50">
                    <Tag size={12} />
                    {feedback.category}
                  </div>
                  {feedback.sentiment && (
                    <div className={`flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-md border border-slate-200/50 font-bold ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    <span className="text-blue-400/80">Discuss</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{formatDate(feedback.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

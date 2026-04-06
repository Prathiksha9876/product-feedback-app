import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ChevronUp, MessageSquare, Send, Tag, Clock, ArrowLeft, Star } from 'lucide-react';

const FeedbackDetail = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchDetails = async () => {
    try {
      const { data } = await api.get(`/feedback/${id}`);
      setFeedback(data.feedback);
      setComments(data.comments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line
  }, [id]);

  const handleVote = async () => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }
    try {
      await api.put(`/feedback/${id}/vote`);
      fetchDetails();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/comments/${id}`, { text: newComment });
      setNewComment('');
      fetchDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!feedback) {
    return <div className="text-center py-20 text-slate-600">Feedback not found</div>;
  }

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

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mb-6 inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Feedback
      </Link>

      {/* Main Feedback Card */}
      <div className="glass p-6 md:p-8 rounded-2xl mb-8 flex gap-6">
        <button 
          onClick={handleVote}
          className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[60px] h-fit border transition-colors ${
            user && feedback.upvotes?.some(u => u._id === user._id)
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
              : 'bg-white/60 border-white/60 text-slate-600 hover:border-slate-400 hover:bg-white/70'
          }`}
        >
          <ChevronUp className="w-6 h-6 -mb-1" />
          <span className="font-bold text-lg">{feedback.upvotes?.length || 0}</span>
        </button>

        <div className="flex-grow">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">
              {feedback.title}
            </h1>
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

          {feedback.rating && (
            <div className="flex items-center gap-1 mb-4 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < feedback.rating ? 'currentColor' : 'none'} className={i < feedback.rating ? '' : 'text-slate-300'} />
              ))}
            </div>
          )}
          
          <p className="text-slate-700 mb-6 text-base leading-relaxed whitespace-pre-wrap">
            {feedback.description}
          </p>

          {feedback.image && (
            <div className="mb-6">
              <img 
                src={feedback.image.startsWith('http') ? feedback.image : `http://localhost:5000${feedback.image}`} 
                alt="Feedback attachment" 
                className="rounded-xl max-h-96 w-auto border border-slate-200 shadow-sm object-contain bg-slate-50" 
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 border-t border-slate-200/50 pt-4">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200/50">
              <Tag size={14} />
              {feedback.category}
            </div>
            {feedback.sentiment && (
              <div className={`flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200/50 font-bold ${getSentimentColor(feedback.sentiment)}`}>
                {feedback.sentiment} Sentiment
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-slate-500">By {feedback.user?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2">
              <Clock size={14} />
              <span>{formatDate(feedback.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MessageSquare className="text-blue-500" />
          {comments.length} Comments
        </h2>

        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 p-4 rounded-xl bg-white/50 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shrink-0 flex items-center justify-center text-slate-800 font-bold text-sm">
                {comment.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{comment.user?.name}</span>
                  <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No comments yet. Be the first to start the discussion!
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="relative">
            <textarea
              className="w-full bg-slate-900/80 border border-white/60 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500 resize-none pr-14"
              rows="3"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
            <button 
              type="submit"
              className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-500 text-slate-900 p-2 rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="bg-slate-900/80 border border-white/60 rounded-xl p-6 text-center">
            <p className="text-slate-600 mb-3">You must be logged in to leave a comment.</p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackDetail;

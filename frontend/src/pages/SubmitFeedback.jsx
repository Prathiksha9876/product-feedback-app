import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, AlertTriangle, Star, Image as ImageIcon, X } from 'lucide-react';

const SubmitFeedback = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Improvement');
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e, force = false) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a star rating (1-5)');
      return;
    }
    setIsSubmitting(true);
    setError('');
    
    try {
      // If we already saw a duplicate warning and clicked "Submit Anyway", we could pass a force flag to backend
      // But for simplicity, we'll just re-submit or bypass the check. 
      // Actually, my backend returns 409 Conflict with the similarFeedback. Let's handle it here.
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('rating', rating);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/feedback', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateWarning(err.response.data.similarFeedback);
        setError('Potential duplicate found. Did you mean to upvote this instead?');
      } else {
        setError(err.response?.data?.message || 'Failed to submit feedback');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link to="/" className="text-purple-600 hover:text-purple-500 text-sm font-medium transition-colors mb-4 inline-block flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <PlusCircle className="text-purple-500" />
          Create New Feedback
        </h1>
        <p className="text-slate-600 mt-2">Share your ideas, report bugs, or request features</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold mb-1">{error}</p>
              {duplicateWarning && (
                <div className="mt-3 bg-white/50 p-3 rounded-lg border border-white/60">
                  <p className="font-medium text-slate-900">{duplicateWarning.title}</p>
                  <button 
                    onClick={() => navigate(`/feedback/${duplicateWarning._id}`)}
                    className="text-blue-400 hover:text-blue-300 mt-2 text-sm font-medium"
                  >
                    View existing feedback →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Feedback Title</label>
            <p className="text-xs text-slate-600 mb-3">Add a short, descriptive headline</p>
            <input 
              type="text" 
              required
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-500"
              placeholder="e.g. Add dark mode"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDuplicateWarning(null); setError(''); }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Rating</label>
            <p className="text-xs text-slate-600 mb-3">Rate the importance or severity</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => { setRating(star); setError(''); }}
                  className={`p-1 focus:outline-none transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
                >
                  <Star fill={rating >= star ? 'currentColor' : 'none'} size={32} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Category</label>
            <p className="text-xs text-slate-600 mb-3">Choose a category for your feedback</p>
            <select 
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Improvement">Improvement</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug">Bug</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Feedback Detail</label>
            <p className="text-xs text-slate-600 mb-3">Include any specific details on what should be improved, added, etc.</p>
            <textarea 
              required
              rows="5"
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-500 resize-none"
              placeholder="e.g. It would be great to see..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Attach Image</label>
            <p className="text-xs text-slate-600 mb-3">Optional: Upload a screenshot (JPG, PNG, up to 5MB)</p>
            {!imagePreview ? (
              <div className="relative border-2 border-dashed border-slate-300 w-full sm:w-1/2 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <ImageIcon className="mx-auto text-slate-400 mb-2" size={32} />
                <span className="text-sm text-slate-500 font-medium">Click to upload image</span>
              </div>
            ) : (
              <div className="relative inline-block mt-2">
                <img src={imagePreview} alt="Preview" className="h-32 rounded-lg border border-slate-200 object-cover shadow-sm" />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200/50">
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white transition-colors mr-3 font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-8 py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-500/25 text-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? 'Sumitting...' : 'Add Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitFeedback;

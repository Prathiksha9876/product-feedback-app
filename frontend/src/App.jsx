import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SubmitFeedback from './pages/SubmitFeedback';
import FeedbackDetail from './pages/FeedbackDetail';
import AdminDashboard from './pages/AdminDashboard';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

const UserRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user && user.role !== 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-16">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/feedback/:id" 
              element={
                <PrivateRoute>
                  <FeedbackDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/submit" 
              element={
                <UserRoute>
                  <SubmitFeedback />
                </UserRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

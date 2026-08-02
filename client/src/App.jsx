 import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';
import TPODashboard from './pages/TPODashboard.jsx';
import Jobs from './pages/Jobs.jsx';
import PostJob from './pages/PostJob.jsx';
import MyApplications from './pages/MyApplications.jsx';
import CompanyApplications from './pages/CompanyApplications.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx';
import InterviewPrep from './pages/InterviewPrep.jsx';
import AIChat from './pages/AIChat.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Role-Based Dashboards */}
          <Route path="/student-dashboard" element={<PrivateRoute allowedRoles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/company-dashboard" element={<PrivateRoute allowedRoles={['company']}><CompanyDashboard /></PrivateRoute>} />
          <Route path="/tpo-dashboard" element={<PrivateRoute allowedRoles={['tpo']}><TPODashboard /></PrivateRoute>} />

          {/* Jobs & Applications */}
          <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
          <Route path="/applications" element={<PrivateRoute allowedRoles={['student']}><MyApplications /></PrivateRoute>} />
          <Route path="/post-job" element={<PrivateRoute allowedRoles={['company']}><PostJob /></PrivateRoute>} />
          <Route path="/company-applications" element={<PrivateRoute allowedRoles={['company']}><CompanyApplications /></PrivateRoute>} />

          {/* 🔥 AI FEATURES */}
          <Route path="/resume-analyzer" element={<PrivateRoute allowedRoles={['student']}><ResumeAnalyzer /></PrivateRoute>} />
          <Route path="/interview-prep" element={<PrivateRoute allowedRoles={['student']}><InterviewPrep /></PrivateRoute>} />
          <Route path="/ai-chat" element={<PrivateRoute allowedRoles={['student']}><AIChat /></PrivateRoute>} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
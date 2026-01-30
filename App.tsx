
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './pages/LoginScreen';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FeedbackModal from './components/common/FeedbackModal';

// 页面组件
import StudentList from './components/teacher/StudentList';
import StudentDetail from './components/teacher/StudentDetail';
import TaskCenter from './components/teacher/TaskCenter';
import TargetLibrary from './components/common/features/TargetLibrary';
import ReportCenter from './components/teacher/ReportCenter';
import ReviewAnalytics from './components/teacher/ReviewAnalytics';
import UserProfile from './components/teacher/UserProfile';
import AccountSettings from './components/teacher/AccountSettings';

// 路由守卫
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role || '')) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const MainApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 基础重定向 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 登录页 */}
        <Route path="/login" element={<LoginScreen onLogin={() => {}} />} />

        {/* 教师端模块 */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher" element={<TeacherDashboard onLogout={() => {}} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={null} />
            <Route path="students" element={<StudentList onStudentClick={(id) => {}} />} />
            <Route path="students/:id" element={<StudentDetail onBack={() => window.history.back()} onNavigateToTranscript={() => {}} />} />
            <Route path="tasks" element={<TaskCenter />} />
            <Route path="knowledge" element={<TargetLibrary role="teacher" />} />
            <Route path="reports" element={<ReportCenter />} />
            <Route path="review" element={<ReviewAnalytics />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Route>

        {/* 学生端模块 */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />}>
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="dashboard" element={null} />
             <Route path="planning" element={null} />
             <Route path="tasks" element={null} />
             <Route path="knowledge" element={null} />
          </Route>
        </Route>
      </Routes>
      <FeedbackModal />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;

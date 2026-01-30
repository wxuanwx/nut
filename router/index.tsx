
import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import About from '@/pages/About';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';

// 教师模块组件
import StudentList from '@/components/teacher/StudentList';
import TaskCenter from '@/components/teacher/TaskCenter';
import TargetLibrary from '@/components/common/features/TargetLibrary';
import ReportCenter from '@/components/teacher/ReportCenter';
import ReviewAnalytics from '@/components/teacher/ReviewAnalytics';
import StudentDetail from '@/components/teacher/StudentDetail';
import UserProfile from '@/components/teacher/UserProfile';
import AccountSettings from '@/components/teacher/AccountSettings';

// 路由守卫
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role || '')) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  
  // 教师端页面结构
  {
    path: '/teacher',
    element: <ProtectedRoute allowedRoles={['teacher']} />,
    children: [
      {
        path: '',
        element: <TeacherDashboard onLogout={() => {}} />,
        children: [
          { index: true, element: <Home /> },
          { path: 'dashboard', element: <Home /> },
          { path: 'students', element: <StudentList onStudentClick={() => {}} /> },
          { path: 'students/:id', element: <StudentDetail onBack={() => window.history.back()} onNavigateToTranscript={() => {}} /> },
          { path: 'tasks', element: <TaskCenter /> },
          { path: 'knowledge', element: <TargetLibrary role="teacher" /> },
          { path: 'reports', element: <ReportCenter /> },
          { path: 'review', element: <ReviewAnalytics /> },
          { path: 'profile', element: <UserProfile /> },
          { path: 'settings', element: <AccountSettings /> }
        ]
      }
    ]
  },

  // 学生端页面结构
  {
    path: '/student',
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        path: '',
        element: <StudentDashboard />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: null },
          { path: 'planning', element: null },
          { path: 'tasks', element: null },
          { path: 'knowledge', element: <TargetLibrary role="student" /> }
        ]
      }
    ]
  },
  
  { path: '/about', element: <About /> },
  { path: '*', element: <Navigate to="/login" replace /> }
]);

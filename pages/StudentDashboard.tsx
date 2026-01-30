
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Map, CheckSquare, BookOpen, User, Settings, LogOut, ChevronDown, Library, School
} from '../components/common/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

// 内容组件
import StudentHome from '../components/student/StudentHome';
import StudentPlanningView from '../components/student/StudentPlanningView';
import StudentTaskCenter from '../components/student/StudentTaskCenter';
import TargetLibrary from '../components/common/features/TargetLibrary';

const StudentDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isEn = language === 'en-US';

  const navItems = [
    { path: '/student/dashboard', label: isEn ? 'Dashboard' : '首页', icon: LayoutGrid },
    { path: '/student/planning', label: isEn ? 'My Plan' : '我的规划', icon: Map },
    { path: '/student/tasks', label: isEn ? 'Tasks' : '任务中心', icon: CheckSquare },
    { path: '/student/knowledge', label: isEn ? 'Knowledge' : '知识库', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f8f6] dark:bg-zinc-950 transition-colors duration-300">
      
      {/* 顶部企业导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-[#e5e0dc] dark:border-white/5 shadow-sm px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
               <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Nut Student</span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                    ${isActive 
                      ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' 
                      : 'text-gray-500 dark:text-zinc-400 hover:text-violet-700 hover:bg-violet-50/50'}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 relative">
             <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
             >
                <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-zinc-800">
                  {user?.name.charAt(0)}
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
             </button>

             {isProfileOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-1 z-20">
                    <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5 mb-1">
                       <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                       <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button onClick={() => {logout(); navigate('/login')}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"><LogOut className="w-4 h-4" /> 退出登录</button>
                 </div>
               </>
             )}
          </div>
      </header>

      {/* 动态内容 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
         {location.pathname === '/student/dashboard' && <StudentHome onNavigateToPlan={() => navigate('/student/planning')} />}
         {location.pathname === '/student/planning' && <StudentPlanningView />}
         {location.pathname === '/student/tasks' && <StudentTaskCenter />}
         {location.pathname === '/student/knowledge' && <TargetLibrary role="student" />}
         <Outlet />
      </main>
    </div>
  );
};

export default StudentDashboard;

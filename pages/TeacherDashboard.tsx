
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Users, Library, CheckSquare, FileBarChart, PieChart, 
  ChevronDown, User, LogOut, Settings, Bell, Search, ChevronRight
} from '../components/common/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

import StudentOverview from '../components/teacher/StudentOverview';
import RiskCard from '../components/teacher/RiskCard';
import TaskList from '../components/teacher/TaskList';
import ReviewSnapshot from '../components/teacher/ReviewSnapshot';

const TeacherDashboard: React.FC<{ onLogout: () => void }> = () => {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isEn = language === 'en-US';

  const navItems = [
    { path: '/teacher/dashboard', label: isEn ? 'Dashboard' : '首页', icon: LayoutGrid },
    { path: '/teacher/students', label: isEn ? 'Students' : '学生管理', icon: Users },
    { path: '/teacher/tasks', label: isEn ? 'Tasks' : '任务中心', icon: CheckSquare },
    { path: '/teacher/knowledge', label: isEn ? 'Knowledge' : '学校专业库', icon: Library },
    { path: '/teacher/reports', label: isEn ? 'Reports' : '报告中心', icon: FileBarChart },
    { path: '/teacher/review', label: isEn ? 'Review' : '复盘报表', icon: PieChart },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p && p !== 'teacher');
    return paths.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  };

  const isHome = location.pathname === '/teacher/dashboard';

  return (
    <div className="flex h-screen bg-[#f9f8f6] dark:bg-zinc-950 overflow-hidden">
      
      {/* 侧边栏 */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-zinc-900 border-r border-[#e5e0dc] dark:border-white/5 flex flex-col transition-all duration-300 z-50`}>
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#e5e0dc] dark:border-white/5">
           <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-primary-200 dark:shadow-none">N</div>
           {!isSidebarCollapsed && <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Nut Project</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
           {navItems.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               className={({ isActive }) => `
                 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                 ${isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                    : 'text-gray-500 dark:text-zinc-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-700 dark:hover:text-white'}
               `}
             >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
             </NavLink>
           ))}
        </nav>

        <div className="p-4 border-t border-[#e5e0dc] dark:border-white/5">
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
              <ChevronRight className={`w-5 h-5 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
           </button>
        </div>
      </aside>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-[#e5e0dc] dark:border-white/5 flex items-center justify-between px-8 shrink-0 z-40">
           <div className="flex items-center gap-4">
              <div className="flex items-center text-xs text-gray-400 gap-2 font-medium uppercase tracking-wider">
                 <span>NUT</span>
                 <ChevronRight className="w-3 h-3" />
                 {getBreadcrumbs().map((b, i) => (
                    <React.Fragment key={b}>
                       <span className={i === getBreadcrumbs().length - 1 ? 'text-gray-900 dark:text-zinc-100 font-bold' : ''}>{b}</span>
                       {i < getBreadcrumbs().length - 1 && <ChevronRight className="w-3 h-3" />}
                    </React.Fragment>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden lg:flex relative">
                 <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-white/10 rounded-full text-xs w-64 outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="全局搜索学生、文件、任务..." />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
              </button>
              
              <div className="relative">
                 <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <img src={user?.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="avatar" />
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isProfileOpen && (
                   <>
                    <div className="fixed inset-0" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-1 z-50 overflow-hidden">
                       <button onClick={() => {navigate('/teacher/profile'); setIsProfileOpen(false)}} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"><User className="w-4 h-4" /> 个人资料</button>
                       <button onClick={() => {navigate('/teacher/settings'); setIsProfileOpen(false)}} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"><Settings className="w-4 h-4" /> 账户设置</button>
                       <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                       <button onClick={() => {logout(); navigate('/login')}} className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 font-bold"><LogOut className="w-4 h-4" /> 退出登录</button>
                    </div>
                   </>
                 )}
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
           {isHome ? (
              <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
                <div className="mb-8">
                   <h1 className="text-2xl font-black text-gray-900 dark:text-white">早安，{user?.name.split(' ')[0]} ☕️</h1>
                   <p className="text-sm text-gray-500 mt-1">这是您今日的升学指导业务概览。</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                   <div className="xl:col-span-2 space-y-6">
                      <StudentOverview />
                      <RiskCard onRiskClick={(type) => navigate(`/teacher/students?filter=${type}`)} />
                   </div>
                   <div className="space-y-6">
                      <TaskList onViewAll={() => navigate('/teacher/tasks')} />
                      <ReviewSnapshot onDetailClick={() => navigate('/teacher/review')} />
                   </div>
                </div>
              </div>
           ) : (
             <div className="p-8 h-full max-w-7xl mx-auto">
                <Outlet />
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;

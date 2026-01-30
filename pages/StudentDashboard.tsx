
import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Map, 
  CheckSquare, 
  BookOpen, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Library,
  School
} from '../components/common/Icons';
import StudentHome from '../components/student/StudentHome';
import StudentPlanningView, { PlanningTab } from '../components/student/StudentPlanningView';
import StudentTaskCenter from '../components/student/StudentTaskCenter';
// Import shared TargetLibrary
import TargetLibrary from '../components/common/features/TargetLibrary';
import StudentProfile from '../components/student/StudentProfile';
import StudentSettings from '../components/student/StudentSettings';
import { useLanguage } from '../contexts/LanguageContext';

interface StudentDashboardProps {
  onLogout: () => void;
}

// Student Specific Navigation Tabs
type StudentTab = 'Dashboard' | 'My Plan' | 'Tasks' | 'Knowledge';

interface NavItemDef {
  id: StudentTab;
  label: string;
  icon: React.ReactNode;
  children?: { id: string; label: string; icon?: React.ReactNode }[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';
  
  const [activeTab, setActiveTab] = useState<StudentTab>('Dashboard');
  const [viewState, setViewState] = useState<string>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [planningInitialTab, setPlanningInitialTab] = useState<PlanningTab>('BasicInfo');

  const navItems: NavItemDef[] = [
    { id: 'Dashboard', label: isEn ? 'Dashboard' : '首页', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'My Plan', label: isEn ? 'My Plan' : '我的规划', icon: <Map className="w-4 h-4" /> },
    { 
      id: 'Knowledge', 
      label: isEn ? 'Knowledge Base' : '知识库', 
      icon: <BookOpen className="w-4 h-4" />,
      children: [
        { id: 'knowledge-library', label: isEn ? 'School Library' : '学校专业库', icon: <Library className="w-4 h-4" /> },
        { id: 'knowledge-resources', label: isEn ? 'Internal Resources' : '内部资料库', icon: <School className="w-4 h-4" /> }
      ]
    },
    { id: 'Tasks', label: isEn ? 'Tasks' : '任务中心', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  const handleNavClick = (item: NavItemDef) => {
    setActiveTab(item.id);
    
    if (item.id === 'Dashboard') setViewState('dashboard');
    else if (item.id === 'My Plan') {
        setViewState('plan');
        setPlanningInitialTab('BasicInfo'); // Reset to default when clicking nav
    }
    else if (item.id === 'Tasks') setViewState('tasks');
    else if (item.id === 'Knowledge') setViewState('knowledge-library');
  };

  const handleSubNavClick = (childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewState(childId);
    setActiveTab('Knowledge');
  };

  const handleNavigateToEssays = () => {
    setPlanningInitialTab('Essays');
    setActiveTab('My Plan');
    setViewState('plan');
  };

  const handleNavigateToPlan = () => {
    setPlanningInitialTab('Planning');
    setActiveTab('My Plan');
    setViewState('plan');
  };

  const handleNavigateToTasks = () => {
    setActiveTab('Tasks');
    setViewState('tasks');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f8f6] dark:bg-zinc-950 font-sans text-gray-800 dark:text-zinc-100 transition-colors duration-300">
      
      {/* 1. Top Navigation Bar (Violet Theme) */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-[#e5e0dc] dark:border-white/5 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Nav */}
          <div className="flex items-center">
            <div className="mr-8 flex items-center gap-2">
               {/* Student Theme: Violet Logo */}
               <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30">N</div>
               <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block tracking-tight">Nut Student</span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${activeTab === item.id 
                        ? 'bg-violet-50 text-violet-900 dark:bg-white/10 dark:text-white shadow-sm ring-1 ring-violet-100 dark:ring-white/5' 
                        : 'text-gray-500 dark:text-zinc-400 hover:text-violet-800 hover:bg-violet-50/50 dark:hover:text-zinc-100 dark:hover:bg-white/5'
                      }`}
                  >
                    <span className={activeTab === item.id ? 'text-violet-600 dark:text-white' : 'group-hover:text-violet-600 dark:group-hover:text-white transition-colors'}>{item.icon}</span>
                    {item.label}
                    {item.children && (
                      <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${activeTab === item.id ? 'text-violet-400 dark:text-zinc-400' : 'text-gray-300 dark:text-zinc-500'} group-hover:rotate-180`} />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.children && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-xl dark:shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                      <div className="py-1">
                        {item.children.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={(e) => handleSubNavClick(sub.id, e)}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-violet-50 dark:hover:bg-white/5 hover:text-violet-700 dark:hover:text-white transition-colors
                              ${viewState === sub.id ? 'bg-violet-50 dark:bg-white/10 text-violet-700 dark:text-white font-medium' : 'text-gray-600 dark:text-zinc-400'}
                            `}
                          >
                            {sub.icon && <span className="text-gray-400 dark:text-zinc-500 group-hover:text-violet-500 dark:group-hover:text-white transition-colors">{sub.icon}</span>}
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-4">
             {/* Profile Dropdown */}
             <div className="relative">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                >
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-gray-800 dark:text-zinc-200 leading-none">Alex Chen</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-1 leading-none">Grade 11</p>
                    </div>
                    {/* Student Avatar: Violet Ring */}
                    <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                      A
                    </div>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-xl dark:shadow-black/50 z-20 py-2 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5 dark:ring-white/5">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Alex Chen</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500">alex.c@student.nut.edu</p>
                        </div>
                        <button 
                            onClick={() => { setViewState('profile'); setIsProfileOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" /> {isEn ? 'My Profile' : '个人中心'}
                        </button>
                        <button 
                            onClick={() => { setViewState('settings'); setIsProfileOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" /> {isEn ? 'Settings' : '设置'}
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2"></div>
                        <button 
                            onClick={onLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors rounded-b-lg"
                        >
                          <LogOut className="w-4 h-4" /> {isEn ? 'Log Out' : '退出登录'}
                        </button>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] overflow-hidden">
         {/* Violet decorative background blobs */}
         <div className="absolute top-20 left-[-100px] w-64 h-64 bg-violet-200/20 dark:bg-violet-900/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
         <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

         {viewState === 'dashboard' && (
            <StudentHome 
              onNavigateToEssays={handleNavigateToEssays} 
              onNavigateToPlan={handleNavigateToPlan}
              onNavigateToTasks={handleNavigateToTasks}
            />
         )}
         
         {viewState === 'plan' && <StudentPlanningView initialTab={planningInitialTab} />}

         {viewState === 'knowledge-library' && (
            <div className="h-full overflow-hidden">
               {/* Use the shared component with student role */}
               <TargetLibrary role="student" currentStudentId="1" />
            </div>
         )}

         {viewState === 'knowledge-resources' && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-zinc-500">
               <div className="bg-white dark:bg-zinc-900 p-6 rounded-full shadow-sm mb-4 border border-gray-100 dark:border-white/5">
                  <School className="w-12 h-12 text-violet-500 dark:text-violet-400" />
               </div>
               <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">内部资料库 (Internal Resources)</h2>
               <p className="text-sm text-gray-400 dark:text-zinc-500 max-w-md text-center mb-6">
                  {isEn ? 'Access exclusive resources like past essays and interview questions.' : '查看过往文书范文、面试真题等独家资源。'}
               </p>
               <button onClick={() => setViewState('dashboard')} className="px-4 py-2 border dark:border-white/10 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-zinc-300">{isEn ? 'Back to Home' : '返回首页'}</button>
            </div>
         )}

         {viewState === 'tasks' && <StudentTaskCenter />}

         {viewState === 'profile' && (
            <div className="h-full overflow-y-auto custom-scrollbar">
                <StudentProfile />
            </div>
         )}

         {viewState === 'settings' && (
            <div className="h-full overflow-y-auto custom-scrollbar">
                <StudentSettings />
            </div>
         )}
      </main>
    </div>
  );
};

export default StudentDashboard;

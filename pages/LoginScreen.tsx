
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, GraduationCap, ArrowRight, ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff } from '../components/common/Icons';
import LoginMascot, { MascotState } from '../components/common/LoginMascot';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC<{ onLogin: (role: 'teacher' | 'student') => void }> = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    setMascotState('idle');

    // 模拟延迟
    setTimeout(async () => {
      await login(selectedRole);
      setIsLoading(false);
      setMascotState('success');
      
      setTimeout(() => {
        navigate(`/${selectedRole}/dashboard`);
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      <div className={`hidden lg:flex lg:w-1/2 relative flex-col border-r border-[#e5e0dc] transition-colors duration-500 ${selectedRole === 'student' ? 'bg-slate-50' : 'bg-[#fbf7f5]'}`}>
         <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
            <div className={`w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center font-black text-xl ${selectedRole === 'student' ? 'text-violet-600' : 'text-primary-600'}`}>N</div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Nut Education</span>
         </div>
         <div className="relative flex-1 flex flex-col items-center justify-center p-12">
            <div className="w-full max-w-lg aspect-square relative">
                <LoginMascot state={mascotState} role={selectedRole} />
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-zinc-950">
         <div className="w-full max-w-md mx-auto">
            {!selectedRole ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">欢迎回来</h1>
                        <p className="text-gray-500">请选择您的登录入口以继续。</p>
                    </div>
                    <div className="grid gap-4">
                        <button onClick={() => setSelectedRole('teacher')} className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-primary-600 bg-white transition-all text-left flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Briefcase className="w-7 h-7" /></div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">教师端</h3>
                                <p className="text-xs text-gray-400">升学指导、教务管理</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600" />
                        </button>
                        <button onClick={() => setSelectedRole('student')} className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-violet-600 bg-white transition-all text-left flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform"><GraduationCap className="w-7 h-7" /></div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">学生端</h3>
                                <p className="text-xs text-gray-400">学生、家长查询</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-violet-600" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                    <button onClick={() => setSelectedRole(null)} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" /> 返回</button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{selectedRole === 'teacher' ? '教师登录' : '学生登录'}</h1>
                        <p className="text-gray-500">请输入您的账号和密码。</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">邮箱地址</label>
                            <input type="email" required className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-gray-900" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setMascotState('email')} onBlur={() => setMascotState('idle')} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">密码</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} required className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-gray-900" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setMascotState('password')} onBlur={() => setMascotState('idle')} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> 登录中...</> : '立即登录'}
                        </button>
                    </form>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default LoginScreen;

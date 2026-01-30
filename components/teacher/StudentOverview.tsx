
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, GraduationCap } from '../common/Icons';
import { useLanguage } from '../../contexts/LanguageContext';

// Colors: Nut/Earth Tones
const COLORS = {
  walnut: '#7d5646',
  hazelnut: '#b0826d',
  beige: '#dfc4b6',
  almond: '#f5ebe6',
  cream: '#e5e5e5',
  green: '#577d46', 
};

// Custom Label Renderer
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, index, name, value, color } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.35; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      className="fill-gray-500 dark:fill-zinc-400 text-[10px] font-medium"
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central" 
    >
      {`${name} ${value}`}
    </text>
  );
};

const StudentOverview: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const dataGrade = [
    { name: 'G12', value: 45, color: COLORS.walnut }, 
    { name: 'G11', value: 30, color: COLORS.hazelnut }, 
    { name: 'G10', value: 15, color: COLORS.beige }, 
    { name: 'G9', value: 10, color: COLORS.cream },  
  ];

  const dataDirection = useMemo(() => [
    { name: isEn ? 'US' : '美本', value: 60, color: COLORS.walnut },
    { name: isEn ? 'UK' : '英联邦', value: 30, color: COLORS.hazelnut },
    { name: isEn ? 'Other' : '其他', value: 10, color: COLORS.beige },
  ], [isEn]);

  const dataPhases = useMemo(() => [
    { name: isEn ? 'Phase 0 Onboarding' : 'Phase 0 建档', count: 5, color: '#e5e5e5' },
    { name: isEn ? 'Phase 1 Planning' : 'Phase 1 规划', count: 35, color: '#dfc4b6' },
    { name: isEn ? 'Phase 2 Tutoring' : 'Phase 2 教学', count: 20, color: '#cfa593' }, 
    { name: isEn ? 'Phase 3 App' : 'Phase 3 申请', count: 22, color: '#b0826d' },
    { name: isEn ? 'Phase 4 Admission' : 'Phase 4 录取', count: 12, color: '#7d5646' },
    { name: isEn ? 'Phase 5 Review' : 'Phase 5 复盘', count: 6, color: '#553c35' },
  ], [isEn]);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-[#e5e0dc] dark:border-white/5 h-full flex flex-col overflow-hidden transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 dark:text-zinc-100">{isEn ? 'Student Overview' : '我的学生概览'}</h3>
        <span className="text-xs bg-primary-50 dark:bg-primary-400/10 text-primary-700 dark:text-primary-300 px-2 py-1 rounded font-medium border border-transparent dark:border-white/5">
          {isEn ? 'This Semester' : '本学期'}
        </span>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex items-center gap-4 mb-4 bg-gray-50 dark:bg-zinc-850 p-4 rounded-xl border border-gray-100 dark:border-white/5 flex-shrink-0 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 shadow-sm">
               <Users className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">{isEn ? 'Total Students' : '负责学生总数'}</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">100</p>
                 <span className="text-xs text-green-600 dark:text-green-400 font-medium">↑ 5 {isEn ? 'New' : '新增'}</span>
               </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
             <div className="relative w-full h-full flex flex-col items-center justify-center min-h-0">
                <p className="absolute top-0 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 text-center w-full uppercase tracking-wider">{isEn ? 'By Grade' : '按年级'}</p>
                <div className="w-full h-full mt-4 relative min-h-0" style={{ minHeight: '100px' }}>
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%" debounce={300}>
                      <PieChart>
                        <Pie
                          data={dataGrade}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          label={renderCustomizedLabel}
                          labelLine={{ stroke: '#52525b', strokeWidth: 1, opacity: 0.3 }}
                        >
                          {dataGrade.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{fontSize:'12px', borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.3)', backgroundColor: '#18181b', color: '#fff'}} itemStyle={{color: '#fff'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
             </div>

             <div className="relative w-full h-full flex flex-col items-center justify-center min-h-0">
                <p className="absolute top-0 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 text-center w-full uppercase tracking-wider">{isEn ? 'By Region' : '按方向'}</p>
                <div className="w-full h-full mt-4 relative min-h-0" style={{ minHeight: '100px' }}>
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%" debounce={300}>
                      <PieChart>
                        <Pie
                          data={dataDirection}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          label={renderCustomizedLabel}
                          labelLine={{ stroke: '#52525b', strokeWidth: 1, opacity: 0.3 }}
                        >
                          {dataDirection.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{fontSize:'12px', borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.3)', backgroundColor: '#18181b', color: '#fff'}} itemStyle={{color: '#fff'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col justify-center border-l border-dashed border-gray-100 dark:border-white/10 pl-6 lg:pl-8 min-w-0 transition-colors">
           <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
             <GraduationCap className="w-4 h-4 text-primary-400 dark:text-primary-500" />
             {isEn ? 'Phase Distribution' : '阶段分布 (Phase 0-5)'}
           </p>
           <div className="space-y-3 pr-2">
              {dataPhases.map((phase, idx) => (
                <div key={idx} className="group cursor-default">
                   <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-zinc-300 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors">
                        {phase.name}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-100 dark:border-white/5 group-hover:border-primary-100 dark:group-hover:border-primary-800/50 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                        {phase.count}
                      </span>
                   </div>
                   <div className="w-full h-1.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden border border-gray-100/50 dark:border-white/5">
                      <div 
                        className="h-full rounded-full transition-all duration-700 relative group-hover:opacity-100 opacity-80"
                        style={{ width: `${(phase.count / 40) * 100}%`, backgroundColor: phase.color }}
                      >
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;

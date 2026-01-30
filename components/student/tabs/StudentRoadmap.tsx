
import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, CheckCircle, Lock, Target, Calendar, 
  ExternalLink, TrendingUp, Star,
  School, AlertTriangle, Zap, Sparkles, MapPin, 
  Clock, Check, ArrowRight, Brain, Briefcase, LayoutGrid,
  Globe, Info, FileText, Bookmark, BarChart3, Flag, Trophy,
  BookOpen, ChevronDown, ChevronUp, ArrowUpRight, List
} from '../../common/Icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SelectedSchool, TimelineEvent, UniversityDisplay } from '../../teacher/planning/PlanningData';

// --- Sub-component: Metric Ruler for Quantitative Gaps ---
const MetricRuler: React.FC<{
  label: string;
  min: number;
  max: number;
  current: number;
  reachAvg: number;
  matchAvg: number;
  safetyAvg: number;
  isEn: boolean;
  diffLabel?: string;
  diffColor?: string;
}> = ({ label, min, max, current, reachAvg, matchAvg, safetyAvg, isEn, diffLabel, diffColor }) => {
  const range = max - min;
  const getPercent = (val: number) => Math.min(Math.max(((val - min) / range) * 100, 0), 100);
  const hasGap = reachAvg > current;

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">{label}</span>
            {diffLabel && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${diffColor}`}>
                    {diffLabel}
                </span>
            )}
        </div>
        <div className="flex items-center gap-3">
            {hasGap && (
                <button className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 px-2 py-1 rounded border border-violet-200 dark:border-violet-500/30 transition-colors flex items-center gap-1 group">
                    {isEn ? 'View Plan' : '查看提升方案'} <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
            )}
            <span className="text-xl font-black text-violet-600 dark:text-violet-400">
                {current} <span className="text-xs text-gray-400 font-normal ml-1">My Score</span>
            </span>
        </div>
      </div>
      
      <div className="relative h-10 select-none mt-2">
        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full transform -translate-y-1/2"></div>
        {reachAvg > current && (
           <div 
              className="absolute top-1/2 h-1.5 bg-red-100 dark:bg-red-500/20 transform -translate-y-1/2 z-0"
              style={{ left: `${getPercent(current)}%`, width: `${getPercent(reachAvg) - getPercent(current)}%` }}
           ></div>
        )}
        <div className="absolute top-[24px] left-0 w-full flex justify-between text-[10px] text-gray-300 dark:text-zinc-600 font-mono">
           <span>{min}</span>
           <span>{max}</span>
        </div>
        <div className="absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center group z-10" style={{ left: `${getPercent(safetyAvg)}%` }}>
            <div className="w-0.5 h-3 bg-green-300 dark:bg-green-700 mb-1"></div>
            <div className="absolute top-4 text-[10px] text-green-600 dark:text-green-500 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-green-100 dark:border-green-900 whitespace-nowrap shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
               {isEn ? 'Safety' : '保底'} {safetyAvg}
            </div>
        </div>
        <div className="absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center group z-20" style={{ left: `${getPercent(matchAvg)}%` }}>
            <div className="w-0.5 h-4 bg-blue-300 dark:bg-blue-700 mb-1"></div>
            <div className="absolute top-5 text-[10px] text-blue-600 dark:text-blue-500 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900 whitespace-nowrap shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
               {isEn ? 'Match' : '匹配'} {matchAvg}
            </div>
        </div>
        <div className="absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center group z-30" style={{ left: `${getPercent(reachAvg)}%` }}>
            <div className="w-0.5 h-5 bg-red-300 dark:bg-red-700 mb-1"></div>
            <div className="absolute top-6 text-[10px] text-red-600 dark:text-red-500 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900 whitespace-nowrap shadow-sm">
               {isEn ? 'Reach' : '冲刺'} {reachAvg}
            </div>
        </div>
        <div className="absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center z-40 transition-all duration-700 ease-out" style={{ left: `${getPercent(current)}%` }}>
           <div className="w-4 h-4 rounded-full bg-violet-600 border-2 border-white dark:border-zinc-900 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
           <div className="absolute -top-7 bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">You</div>
        </div>
      </div>
    </div>
  );
};

const SchoolCard: React.FC<{ school: SelectedSchool; isEn: boolean; tierStyle: string; }> = ({ school, isEn, tierStyle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const nextDeadline = school.deadlines ? school.deadlines.split('\n')[0] : '';
    return (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800/20 overflow-hidden hover:shadow-md transition-all">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-zinc-800/50 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm p-1">
                        <img src={school.uni.logo} className="w-full h-full object-contain" alt={school.uni.name} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{school.uni.name}</p>
                            {school.tier === 'Reach' && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500 dark:text-zinc-400">Rank {school.uni.rank}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                            <span className="text-[10px] font-medium text-gray-700 dark:text-zinc-300">{school.major}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!isOpen && nextDeadline && (
                        <div className="text-right hidden sm:block animate-in fade-in">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{isEn ? 'Next Deadline' : '最近截止'}</p>
                            <p className="text-xs font-mono font-medium text-red-600 dark:text-red-400">{nextDeadline}</p>
                        </div>
                    )}
                    <div className={`p-1.5 rounded-full transition-transform duration-200 ${isOpen ? 'bg-gray-200 dark:bg-zinc-700 rotate-180' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5 text-xs animate-in slide-in-from-top-2">
                    <div className="p-4 space-y-2">
                        <p className="font-bold text-gray-500 dark:text-zinc-500 uppercase text-[10px] flex items-center gap-1"><FileText className="w-3 h-3" /> {isEn ? 'Official Requirements' : '官网录取要求'}</p>
                        <div className="text-gray-700 dark:text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">{school.requirements || '-'}</div>
                    </div>
                    <div className="p-4 space-y-2 bg-yellow-50/30 dark:bg-yellow-500/5">
                        <p className="font-bold text-yellow-700 dark:text-yellow-500 uppercase text-[10px] flex items-center gap-1"><Info className="w-3 h-3" /> {isEn ? 'Admission Advice' : '实际录取建议 (Advice)'}</p>
                        <div className="text-gray-700 dark:text-zinc-300 leading-relaxed italic">{school.admissionAdvice || '-'}</div>
                    </div>
                    <div className="p-4 space-y-2">
                        <p className="font-bold text-gray-500 dark:text-zinc-500 uppercase text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" /> {isEn ? 'Key Deadlines' : '关键时间 (Deadlines)'}</p>
                        <div className="text-gray-700 dark:text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">{school.deadlines || '-'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StudentRoadmap: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('section-strategy');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const sections = ['section-strategy', 'section-schools', 'section-gaps', 'section-courses', 'section-timeline'];
      let current = sections[0];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
           const rect = el.getBoundingClientRect();
           if (rect.top < 250) current = id;
        }
      }
      setActiveSection(current);
    };
    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const aiAnalysis = {
    title: isEn ? "Core Insight (AI Synthesis)" : "核心洞察 (AI Synthesis)",
    content: isEn 
      ? "The student is a typical high-math-talent individual. It is recommended to follow an elite path of 'Technology as the foundation, Finance as the application'. Leveraging their outstanding performance in AMC 12 and interest in complex systems, they should avoid repetitive traditional finance roles and instead target high-barrier Quantitative Finance or frontier AI fields. This strategy utilizes their logical strengths, satisfies their desire to 'do cool things', and perfectly bridges their family's deep connections in the financial sector for a high-trajectory career launch."
      : "该生是一名典型的高数理天赋型学生，建议走“技术为本、金融为用”的精英路径。利用其AMC 12的优异表现和对复杂系统的兴趣，避开传统金融的重复性业务，转而攻克技术壁垒极高的量化金融或前沿AI领域。这既能发挥其逻辑专长并满足“做酷事”的心理需求，又能完美衔接家庭在金融圈的深厚人脉，实现高起点的职业爆发。"
  };

  const targetPreferences = [
    { id: 1, region: 'US', label: isEn ? 'United States' : '美国 (United States)', icon: '🇺🇸', majors: isEn ? ['Computer Science', 'Financial Engineering'] : ['Computer Science', 'Financial Engineering'] },
    { id: 2, region: 'UK', label: isEn ? 'United Kingdom' : '英国 (United Kingdom)', icon: '🇬🇧', majors: isEn ? ['Computer Science', 'Mathematics'] : ['Computer Science', 'Mathematics'] }
  ];

  const recommendedMajors = [
    { name: isEn ? "Financial Engineering" : "Financial Engineering", match: 95, reason: isEn ? "Matched with AMC 12 and family resources." : "与 AMC 12 数学背景及家庭资源高度匹配。" },
    { name: isEn ? "Computer Science" : "Computer Science", match: 90, reason: isEn ? "Strong logical potential from LEGO interests." : "乐高兴趣体现出的逻辑构建潜力非常适合 CS。" }
  ];

  const mockUni = (name: string, logoSeed: string, rank: number): UniversityDisplay => ({
    id: name, name, cnName: name, logo: `https://api.dicebear.com/7.x/initials/svg?seed=${logoSeed}&backgroundColor=f1f5f9`, 
    rank, region: 'US', tags: [], avgGpa: 4.0, minToefl: 100, avgSat: 1500
  });

  const finalSchools: SelectedSchool[] = [
    { id: 's1', uni: mockUni('Carnegie Mellon Univ.', 'CMU', 22), tier: 'Reach', major: 'Financial Engineering', requirements: 'TOEFL 105+\nSAT 1550+', admissionAdvice: 'Math competition (AIME+) essential.', deadlines: 'ED1: Nov 1\nRD: Jan 3' },
    { id: 's2', uni: mockUni('Cornell University', 'Cornell', 12), tier: 'Reach', major: 'CS (Engineering)', requirements: 'SAT 1540+\nPhysics C Required', admissionAdvice: 'High "Fit" required.', deadlines: 'ED: Nov 1\nRD: Jan 2' },
    { id: 's3', uni: mockUni('UIUC', 'UIUC', 35), tier: 'Match', major: 'Computer Engineering', requirements: 'GPA 3.8+\nTOEFL 100+', admissionAdvice: 'CS is Reach level diff.', deadlines: 'EA: Nov 1 (Priority)' },
    { id: 's4', uni: mockUni('UC San Diego', 'UCSD', 28), tier: 'Match', major: 'Data Science', requirements: 'GPA 3.9 (W)\nTest Blind', admissionAdvice: 'College selection matters.', deadlines: 'RD: Nov 30' },
  ];

  const quantitativeStats = [
    { id: 'gpa', current: 3.85, reach: 3.95, match: 3.65, safety: 3.5, min: 3.0, max: 4.2, label: 'GPA (Weighted)', diffLabel: isEn ? 'Good' : '达标', diffColor: 'bg-green-100 text-green-700' },
    { id: 'toefl', current: 102, reach: 110, match: 90, safety: 80, min: 80, max: 120, label: 'TOEFL', diffLabel: isEn ? 'Gap -8' : '差距 -8', diffColor: 'bg-red-100 text-red-700' },
    { id: 'sat', current: 1450, reach: 1520, match: 1440, safety: 1350, min: 1200, max: 1600, label: 'SAT', diffLabel: isEn ? 'Gap -50' : '差距 -50', diffColor: 'bg-red-100 text-red-700' }
  ];

  const timelineEvents: TimelineEvent[] = [
    { id: 't1', title: isEn ? 'Submit ED Application (CMU)' : '提交早申 (CMU)', startDate: '2024-10', type: 'Point', category: 'Application', status: 'In Progress', priority: 'High', assignee: 'Student', isMilestone: true },
    { id: 't2', title: isEn ? 'AMC 12 Competition' : 'AMC 12 数学竞赛', startDate: '2024-11', type: 'Point', category: 'Exam', status: 'Pending', priority: 'Medium', assignee: 'Student', isMilestone: true },
  ];

  const scrollToSection = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={containerRef} className="p-6 lg:p-8 h-full overflow-y-auto custom-scrollbar bg-[#fcfcfc] dark:bg-zinc-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                 <Compass className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                 {isEn ? 'My Strategic Roadmap' : '我的升学战略蓝图'}
              </h2>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-9 space-y-10 min-w-0">
                <div id="section-strategy" className="space-y-6 scroll-mt-6">
                    <div className="bg-[#a37f6e] bg-opacity-5 dark:bg-opacity-10 border-l-4 border-[#a37f6e] rounded-r-xl p-6 shadow-sm">
                        <h3 className="font-bold text-[#7d5646] dark:text-[#cfa593] flex items-center gap-2 mb-3 text-base">
                            <Brain className="w-5 h-5" /> {aiAnalysis.title}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed font-medium">{aiAnalysis.content}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        <div className="flex flex-col h-full">
                            <h3 className="font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2 mb-4 text-base"><Briefcase className="w-5 h-5 text-gray-500" /> {isEn ? 'Recommended Direction' : '推荐专业方向'}</h3>
                            <div className="space-y-4 flex-1">
                                {recommendedMajors.map((major, idx) => (
                                    <div key={idx} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{major.name}</h4>
                                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">{isEn ? 'Match' : '契合度'} {major.match}%</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{major.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="section-schools" className="space-y-6 scroll-mt-6">
                    <h3 className="font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2 text-base"><School className="w-5 h-5 text-rose-500" /> {isEn ? 'Final School List' : '定校清单'}</h3>
                    <div className="space-y-4">
                        {finalSchools.map((school) => (
                            <SchoolCard key={school.id} school={school} isEn={isEn} tierStyle={getTierStyle(school.tier)} />
                        ))}
                    </div>
                </div>

                <div id="section-gaps" className="space-y-6 scroll-mt-6">
                        <h4 className="font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2 text-sm"><LayoutGrid className="w-4 h-4 text-purple-500" /> 1. {isEn ? 'Quantitative Gaps' : '硬性指标差距'}</h4>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e0dc] dark:border-white/5 p-6 shadow-sm">
                            <div className="space-y-4">
                            {quantitativeStats.map((stat) => (
                                <MetricRuler key={stat.id} {...stat} reachAvg={stat.reach} matchAvg={stat.match} safetyAvg={stat.safety} isEn={isEn} />
                            ))}
                            </div>
                        </div>
                </div>

                <div id="section-timeline" className="space-y-6 scroll-mt-6">
                        <h3 className="font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2 text-base mb-4"><Calendar className="w-5 h-5 text-emerald-500" /> {isEn ? 'Key Milestones' : '关键节点'}</h3>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e0dc] dark:border-white/5 p-6 relative overflow-hidden">
                            <div className="absolute top-6 bottom-6 left-[27px] w-0.5 bg-gray-100 dark:bg-white/10"></div>
                            <div className="space-y-6 relative z-10">
                            {timelineEvents.map((evt, idx) => (
                                <div key={idx} className="flex items-start gap-4 group">
                                    <div className={`w-3 h-3 mt-1.5 rounded-full border-2 flex-shrink-0 z-10 bg-white dark:bg-zinc-900 transition-colors ${evt.status === 'In Progress' ? 'border-violet-500 bg-violet-500 ring-4 ring-violet-100' : 'border-gray-300'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-bold ${evt.status === 'In Progress' ? 'text-violet-700' : 'text-gray-700'}`}>{evt.title}</p>
                                            <span className="text-[10px] font-mono text-gray-400">{evt.startDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                </div>
            </div>

            <div className="hidden lg:block lg:col-span-3 relative">
                <div className="sticky top-6 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-4">{isEn ? 'On This Page' : '本页目录'}</h4>
                    <nav className="flex flex-col space-y-1">
                        {[{ id: 'section-strategy', label: isEn ? 'Strategy' : '战略蓝图' }, { id: 'section-schools', label: isEn ? 'School List' : '定校清单' }, { id: 'section-gaps', label: isEn ? 'Gap Analysis' : '差距分析' }, { id: 'section-timeline', label: isEn ? 'Timeline' : '关键节点' }].map(item => (
                            <button key={item.id} onClick={() => scrollToSection(item.id)} className={`text-left text-sm py-1.5 pl-4 border-l-2 transition-all ${activeSection === item.id ? 'border-violet-600 text-violet-700 font-bold' : 'border-transparent text-gray-500'}`}>{item.label}</button>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const getTierStyle = (tier: string) => {
    switch(tier) {
      case 'Reach': return 'bg-red-50 text-red-700 border-red-100';
      case 'Match': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-green-50 text-green-700 border-green-100';
    }
};

export default StudentRoadmap;

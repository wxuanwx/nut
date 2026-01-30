
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, Globe, BookOpen, Star, 
  TrendingUp, CheckCircle, ArrowRight, ArrowLeft, 
  Plus, Bookmark, ExternalLink, School, Copy, 
  AlertTriangle, Info, ArrowUpRight, Check,
  Clock, FileText, Briefcase, Users, LayoutGrid, Building,
  ChevronDown,
  RefreshCw,
  XCircle
} from '../Icons';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { mockStudents } from '../../teacher/StudentList';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EmploymentStatItem { name: string; count: number; }
interface TargetProgram {
  id: string; schoolName: string; schoolLogo: string; programName: string; location: string;
  region: 'US' | 'UK' | 'HK' | 'SG'; ranking: string; rankingLabel: string; rankingLabelEn?: string;
  difficulty: 'High' | 'Medium' | 'Low'; difficultyLabel: string; difficultyLabelEn?: string;
  trend: 'Rising' | 'Stable' | 'Falling'; tags: string[]; description: string; descriptionEn?: string;
  req_gpa: string; req_language: string; req_standardized: string; req_subjects: string[]; 
  checklist: { item: string; required: boolean; note?: string; itemEn?: string; noteEn?: string }[];
  trendData: { year: string; rate: number; score: number }[]; trendSummary: string; trendSummaryEn?: string;
  source: string; updateTime: string; employment?: { avgSalary: string; employmentRate: string; alumniCount: number; whereTheyWork: EmploymentStatItem[]; whatTheyDo: EmploymentStatItem[]; source: string; };
}

interface TargetLibraryProps { role?: 'teacher' | 'student'; currentStudentId?: string; }

const mockPrograms: TargetProgram[] = [
  {
    id: 'p1', schoolName: 'Carnegie Mellon University', schoolLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=CMU&backgroundColor=b91c1c',
    programName: 'B.S. in Computer Science', location: 'Pittsburgh, PA', region: 'US', ranking: '#1', rankingLabel: 'CS Ranking #1',
    difficulty: 'High', difficultyLabel: 'T0 极高', trend: 'Rising', tags: ['STEM', '高薪就业'],
    description: 'CMU CS 是全球最顶尖的计算机项目之一。', req_gpa: '3.9+', req_language: '102+', req_standardized: '1550+', req_subjects: ['Calculus'],
    checklist: [{ item: 'Essay', required: true }], trendData: [{ year: '2024', rate: 4.8, score: 1570 }], trendSummary: '难度持续走高。',
    source: 'CMU Official', updateTime: '2024-09-01'
  }
];

const TargetLibrary: React.FC<TargetLibraryProps> = ({ role = 'teacher', currentStudentId }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = role === 'student' ? 'violet' : 'primary';
  const mainHex = role === 'student' ? '#7c3aed' : '#966a57';

  const filteredPrograms = mockPrograms.filter(p => p.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeProgram = mockPrograms.find(p => p.id === selectedId);

  return (
    <div className="bg-[#f9f8f6] dark:bg-zinc-950 h-full flex flex-col p-6">
      {view === 'list' ? (
        <div className="flex flex-col gap-6 h-full">
            <div className="bg-white dark:bg-zinc-900 p-2 rounded-[24px] shadow-sm border flex items-center h-[64px] overflow-hidden">
                 <input 
                    className="flex-1 px-4 outline-none bg-transparent dark:text-white" 
                    placeholder={isEn ? "Search school..." : "搜索学校..."} 
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                 />
                 <button 
                    style={{ backgroundColor: mainHex }}
                    className="h-[48px] px-8 text-white font-bold rounded-[18px] hover:opacity-90 transition-all flex items-center gap-2"
                 >
                    <Search className="w-5 h-5" /> {isEn ? 'Search' : '搜索'}
                 </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map(p => (
                    <div key={p.id} onClick={() => { setSelectedId(p.id); setView('detail'); }} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border hover:shadow-lg cursor-pointer">
                        <div className="flex items-center gap-3 mb-4">
                            <img src={p.schoolLogo} className="w-12 h-12 rounded-lg" alt="logo" />
                            <h3 className="font-bold dark:text-white">{p.schoolName}</h3>
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">{p.programName}</p>
                    </div>
                ))}
            </div>
        </div>
      ) : activeProgram && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm">
              <button onClick={() => setView('list')} className="text-sm text-gray-500 mb-6 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back</button>
              <h1 className="text-2xl font-bold dark:text-white">{activeProgram.schoolName}</h1>
              <p className="text-gray-500 mt-2">{activeProgram.description}</p>
          </div>
      )}
    </div>
  );
};

export default TargetLibrary;

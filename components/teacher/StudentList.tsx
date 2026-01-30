
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, Plus, 
  MoreHorizontal, AlertTriangle, Clock, CheckCircle, Mail,
  ChevronDown, XCircle, Check, MessageSquare, X
} from '../common/Icons';
import { StudentSummary, RiskLevel } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export const mockStudents: StudentSummary[] = [
  {
    id: '1',
    name: 'Alex Chen',
    studentId: '2025001',
    grade: 'G11',
    class: '11-A',
    direction: 'US',
    phase: 'Phase 2 教学运营',
    status: '规划中',
    targetSummary: 'US Top 30 CS',
    riskLevel: 'high',
    riskCategories: ['成绩风险'],
    riskTags: ['GPA波动', '托福未达标'],
    nextTask: '选校名单确认',
    nextTaskDue: 'Today',
    lastContact: '3 days ago',
    dataCompleteness: 85,
    avatarInitials: 'AC',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=ffdfbf'
  },
  {
    id: '2',
    name: 'Sarah Li',
    studentId: '2025002',
    grade: 'G12',
    class: '12-B',
    direction: 'UK',
    phase: 'Phase 4 录取',
    status: '申请中',
    targetSummary: 'G5 Bio',
    riskLevel: 'none',
    riskCategories: [],
    riskTags: [],
    nextTask: '文书终稿审核',
    nextTaskDue: 'Tomorrow',
    lastContact: 'Yesterday',
    dataCompleteness: 98,
    avatarInitials: 'SL',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Sarah&backgroundColor=d1d4f9'
  },
  {
    id: '3',
    name: 'James Wang',
    studentId: '2025003',
    grade: 'G10',
    class: '10-C',
    direction: 'Global',
    phase: 'Phase 1 规划',
    status: '未建档',
    targetSummary: '待规划',
    riskLevel: 'medium',
    riskCategories: ['任务风险'],
    riskTags: ['缺课外活动规划', '首谈逾期'],
    nextTask: '首次面谈',
    nextTaskDue: 'Next Week',
    lastContact: '14 days ago',
    dataCompleteness: 40,
    avatarInitials: 'JW',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=James&backgroundColor=b6e3f4'
  },
  {
    id: '4',
    name: 'Emily Zhang',
    studentId: '2025004',
    grade: 'G12',
    class: '12-A',
    direction: 'US',
    phase: 'Phase 3 申请',
    status: '申请中',
    targetSummary: 'US Top 20 Arts',
    riskLevel: 'low',
    riskCategories: ['材料风险'],
    riskTags: ['作品集进度慢'],
    nextTask: '作品集Review',
    nextTaskDue: 'In 2 days',
    lastContact: 'Today',
    dataCompleteness: 90,
    avatarInitials: 'EZ',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Emily&backgroundColor=ffd5dc'
  },
  {
    id: '5',
    name: 'Michael Wu',
    studentId: '2025005',
    grade: 'G11',
    class: '11-A',
    direction: 'US',
    phase: 'Phase 2 教学运营',
    status: '规划中',
    targetSummary: 'Top 50 Undecided',
    riskLevel: 'high',
    riskCategories: ['沟通风险', '目标风险'],
    riskTags: ['家长失联', '目标过高'],
    nextTask: '家长会预约',
    nextTaskDue: 'Overdue',
    lastContact: '1 month ago',
    dataCompleteness: 60,
    avatarInitials: 'MW',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Michael&backgroundColor=c0aede'
  }
];

// Added missing StudentListProps interface
interface StudentListProps {
  onStudentClick: (id: string) => void;
  initialFilter?: string | null;
}

const StudentList: React.FC<StudentListProps> = ({ onStudentClick, initialFilter }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const [students, setStudents] = useState<StudentSummary[]>(mockStudents);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    studentId: '',
    grade: 'G10',
    direction: 'US',
    phase: 'Phase 0 建档'
  });

  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [newCommLog, setNewCommLog] = useState({
    studentId: '',
    type: 'Meeting',
    date: new Date().toISOString().slice(0, 16),
    participants: ['Student', 'Counselor'],
    title: '',
    content: ''
  });

  const [riskFilterLabel, setRiskFilterLabel] = useState<string>(isEn ? 'Risk: All' : '风险: 全部'); 
  const [isRiskFilterActive, setIsRiskFilterActive] = useState(false);
  const [activeRiskValue, setActiveRiskValue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState({
    grade: '全部',
    direction: '全部',
    phase: '全部'
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const FILTER_CONFIG = useMemo(() => ({
    grade: { label: isEn ? 'Grade' : '年级', options: ['全部', 'G9', 'G10', 'G11', 'G12'] },
    direction: { label: isEn ? 'Region' : '方向', options: ['全部', 'US', 'UK', 'HK', 'SG', 'Canada', 'Australia', 'Global'] },
    phase: { label: isEn ? 'Phase' : '阶段', options: ['全部', 'Phase 0 建档', 'Phase 1 规划', 'Phase 2 教学运营', 'Phase 3 申请', 'Phase 4 录取', 'Phase 5 复盘'] }
  }), [isEn]);

  const RISK_OPTIONS = useMemo(() => isEn ? ['All', 'Academic', 'Target', 'Task', 'Material', 'Comm'] : ['全部', '成绩风险', '目标风险', '任务风险', '材料风险', '沟通风险'], [isEn]);

  useEffect(() => {
    if (initialFilter) {
      setRiskFilterLabel(isEn ? `Risk: ${initialFilter}` : `风险: ${initialFilter}`);
      setIsRiskFilterActive(true);
      setActiveRiskValue(initialFilter);
    }
  }, [initialFilter, isEn]);

  const handleStudentNav = (id: string) => {
    onStudentClick(id);
    navigate(`/teacher/students/${id}`);
  };

  const handleClearRiskFilter = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRiskFilterLabel(isEn ? 'Risk Filter' : '风险筛选');
    setIsRiskFilterActive(false);
    setActiveRiskValue(null);
    setActiveDropdown(null);
  };

  const handleRiskSelect = (option: string) => {
    if (option === '全部' || option === 'All') {
        handleClearRiskFilter();
    } else {
        setRiskFilterLabel(isEn ? `Risk: ${option}` : `风险: ${option}`);
        setIsRiskFilterActive(true);
        setActiveRiskValue(option);
    }
    setActiveDropdown(null);
  };

  const filteredStudents = students.filter(student => {
    let matchesRisk = true;
    if (isRiskFilterActive && activeRiskValue && activeRiskValue !== '全部' && activeRiskValue !== 'All') {
       const cnMap: Record<string, string> = { 'Academic': '成绩风险', 'Target': '目标风险', 'Task': '任务风险', 'Material': '材料风险', 'Comm': '沟通风险' };
       const checkVal = cnMap[activeRiskValue] || activeRiskValue;
       matchesRisk = student.riskCategories.includes(checkVal);
    }
    let matchesSearch = true;
    if (searchQuery.trim()) {
       const query = searchQuery.toLowerCase().trim();
       matchesSearch = student.name.toLowerCase().includes(query) || student.studentId.includes(query);
    }
    const matchesGrade = filters.grade === '全部' || student.grade === filters.grade;
    const matchesDirection = filters.direction === '全部' || student.direction.includes(filters.direction);
    const matchesPhase = filters.phase === '全部' || student.phase.startsWith(filters.phase);
    return matchesRisk && matchesSearch && matchesGrade && matchesDirection && matchesPhase;
  });

  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      filteredStudents.forEach(s => next.delete(s.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredStudents.forEach(s => next.add(s.id));
      setSelectedIds(next);
    }
  };

  const translateStatus = (status: string) => {
    if (!isEn) return status;
    const map: Record<string, string> = { '未建档': 'Not Started', '规划中': 'Planning', '申请中': 'Applying', '已Offer': 'Offered', '已去向确认': 'Committed' };
    return map[status] || status;
  };

  const getRiskBadge = (level: RiskLevel, categories: string[], tags: string[]) => {
    if (level === 'none') return <span className="text-gray-400 dark:text-zinc-600 text-xs">-</span>;
    const colors = {
      high: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20',
      medium: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
      low: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20', 
      none: ''
    };
    return (
      <div className="flex flex-col items-start gap-1">
        <div className="flex flex-wrap gap-1">
           {categories.map((cat, idx) => (
             <div key={idx} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${colors[level]}`}>
                <AlertTriangle className="w-3 h-3" /> {isEn ? cat : cat}
             </div>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#e5e0dc] dark:border-white/5 flex flex-col h-full min-h-[600px] relative transition-colors duration-300">
      <div className="p-5 border-b border-[#e5e0dc] dark:border-white/5 bg-white dark:bg-zinc-900 rounded-t-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEn ? 'Students' : '学生管理'}</h2>
          <div className="flex gap-3">
             <button onClick={() => setIsCommModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-850 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <MessageSquare className="w-4 h-4" /> {isEn ? 'Log Comm' : '新增沟通记录'}
             </button>
             <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> {isEn ? 'New Student' : '新建学生'}
             </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center relative">
           <div className="relative group z-0">
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" placeholder={isEn ? "Search Name/ID..." : "搜索姓名/学号..."}
               value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-primary-300 dark:focus:border-primary-700 w-64 text-gray-800 dark:text-zinc-200"
             />
           </div>
           
           {(Object.keys(FILTER_CONFIG) as Array<keyof typeof filters>).map((key) => (
               <div key={key as string} className="relative">
                 <button 
                    onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition-colors ${filters[key] !== '全部' ? 'bg-primary-50 dark:bg-primary-400/10 border-primary-200 text-primary-800 dark:text-primary-300' : 'bg-white dark:bg-zinc-850 border-gray-200 text-gray-600 dark:text-zinc-400'}`}
                 >
                    {FILTER_CONFIG[key].label}: <span>{filters[key]}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                 </button>
                 {activeDropdown === key && (
                   <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-900 border rounded-lg shadow-lg z-50 py-1">
                      {FILTER_CONFIG[key].options.map(opt => (
                        <button key={opt} onClick={() => { setFilters({...filters, [key]: opt}); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5">{opt}</button>
                      ))}
                   </div>
                 )}
               </div>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
            <thead className="bg-[#fbf7f5] dark:bg-zinc-900 sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll}/></th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{isEn ? 'Student Info' : '学生信息'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{isEn ? 'Phase/Status' : '阶段/状态'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{isEn ? 'Risks' : '风险'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{isEn ? 'Next Task' : '下一步待办'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">{isEn ? 'Actions' : '操作'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-primary-50/30 dark:hover:bg-white/5 cursor-pointer" onClick={() => handleStudentNav(student.id)}>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(student.id)} onChange={() => { const n = new Set(selectedIds); n.has(student.id) ? n.delete(student.id) : n.add(student.id); setSelectedIds(n); }}/></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatarUrl} className="w-10 h-10 rounded-full border border-gray-200" alt={student.name}/>
                      <div><p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p><p className="text-xs text-gray-500">{student.grade} • {student.direction}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">{student.phase}</span>
                     <p className="text-xs text-gray-500 mt-1">{translateStatus(student.status)}</p>
                  </td>
                  <td className="px-6 py-4">{getRiskBadge(student.riskLevel, student.riskCategories, student.riskTags)}</td>
                  <td className="px-6 py-4">
                     <p className="text-sm text-gray-800 dark:text-zinc-200">{student.nextTask}</p>
                     <p className="text-xs text-red-600 flex items-center gap-1"><Clock className="w-3 h-3"/>{student.nextTaskDue}</p>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                     <button className="p-1.5 text-gray-400 hover:text-primary-600"><MoreHorizontal className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;


import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, Plus, 
  MoreHorizontal, AlertTriangle, Clock, CheckCircle, Mail,
  ChevronDown, XCircle, Check, MessageSquare, X
} from '../common/Icons';
import { StudentSummary, RiskLevel } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface StudentListProps {
  onStudentClick: (id: string) => void;
  initialFilter?: string | null;
}

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

const StudentList: React.FC<StudentListProps> = ({ onStudentClick, initialFilter }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const [students, setStudents] = useState<StudentSummary[]>(mockStudents);
  
  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    studentId: '',
    grade: 'G10',
    direction: 'US',
    phase: 'Phase 0 建档'
  });

  // Add Communication Record Modal State
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
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dynamic Options based on Language
  const FILTER_CONFIG = useMemo(() => ({
    grade: { 
      label: isEn ? 'Grade' : '年级', 
      options: ['全部', 'G9', 'G10', 'G11', 'G12'] 
    },
    direction: { 
      label: isEn ? 'Region' : '方向', 
      options: ['全部', 'US', 'UK', 'HK', 'SG', 'Canada', 'Australia', 'Global'] 
    },
    phase: { 
      label: isEn ? 'Phase' : '阶段', 
      options: [
        '全部', 
        'Phase 0 建档', 
        'Phase 1 规划', 
        'Phase 2 教学运营', 
        'Phase 3 申请', 
        'Phase 4 录取', 
        'Phase 5 复盘'
      ] 
    }
  }), [isEn]);

  const RISK_OPTIONS = useMemo(() => 
    isEn 
    ? ['All', 'Academic', 'Target', 'Task', 'Material', 'Comm'] 
    : ['全部', '成绩风险', '目标风险', '任务风险', '材料风险', '沟通风险'],
  [isEn]);

  useEffect(() => {
    if (initialFilter) {
      setRiskFilterLabel(isEn ? `Risk: ${initialFilter}` : `风险: ${initialFilter}`);
      setIsRiskFilterActive(true);
      setActiveRiskValue(initialFilter);
    } else {
      setRiskFilterLabel(isEn ? 'Risk Filter' : '风险筛选');
      setIsRiskFilterActive(false);
      setActiveRiskValue(null);
    }
  }, [initialFilter, isEn]);

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

  const handleClearSearch = () => setSearchQuery('');

  const toggleDropdown = (key: string) => {
    if (activeDropdown === key) setActiveDropdown(null);
    else setActiveDropdown(key);
  };

  const handleFilterSelect = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActiveDropdown(null);
  };

  const handleClearDropdownFilter = (key: keyof typeof filters, e: React.MouseEvent) => {
    e.stopPropagation();
    setFilters(prev => ({ ...prev, [key]: '全部' }));
    setActiveDropdown(null);
  };

  const handleClearAllFilters = () => {
    handleClearRiskFilter();
    handleClearSearch();
    setFilters({
      grade: '全部',
      direction: '全部',
      phase: '全部'
    });
  };

  const handleAddStudent = () => {
    if (!newStudentForm.name || !newStudentForm.studentId) {
        alert(isEn ? 'Please fill in name and ID' : '请填写姓名和学号');
        return;
    }
    const newStudent: StudentSummary = {
        id: `new-${Date.now()}`,
        name: newStudentForm.name,
        studentId: newStudentForm.studentId,
        grade: newStudentForm.grade,
        class: '待定', 
        direction: newStudentForm.direction,
        phase: newStudentForm.phase as any,
        status: '未建档',
        targetSummary: '待规划',
        riskLevel: 'none',
        riskCategories: [],
        riskTags: [],
        nextTask: '建档面谈',
        nextTaskDue: '待定',
        lastContact: 'Never',
        dataCompleteness: 10,
        avatarInitials: newStudentForm.name.substring(0, 2).toUpperCase(),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newStudentForm.name)}&backgroundColor=e5e7eb`
    };
    mockStudents.unshift(newStudent);
    setStudents([newStudent, ...students]);
    setIsAddModalOpen(false);
    setNewStudentForm({ name: '', studentId: '', grade: 'G10', direction: 'US', phase: 'Phase 0 建档' });
  };

  const handleSaveCommLog = () => {
    if (!newCommLog.studentId || !newCommLog.title) {
        alert(isEn ? 'Please select student and enter title' : '请选择学生并填写主题');
        return;
    }
    const student = students.find(s => s.id === newCommLog.studentId);
    alert(isEn 
        ? `Added log for ${student?.name || 'Unknown'}: ${newCommLog.title}` 
        : `已为学生 ${student?.name || 'Unknown'} 添加沟通记录: ${newCommLog.title}`);
    setIsCommModalOpen(false);
    setNewCommLog({
        studentId: '',
        type: 'Meeting',
        date: new Date().toISOString().slice(0, 16),
        participants: ['Student', 'Counselor'],
        title: '',
        content: ''
    });
  };

  const filteredStudents = students.filter(student => {
    let matchesRisk = true;
    if (isRiskFilterActive && activeRiskValue && activeRiskValue !== '全部' && activeRiskValue !== 'All') {
       const cnMap: Record<string, string> = {
           'Academic': '成绩风险', 'Target': '目标风险', 'Task': '任务风险', 'Material': '材料风险', 'Comm': '沟通风险'
       };
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

  // --- Selection Logic ---
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id));

  const handleSelectAll = () => {
    if (filteredStudents.length === 0) return;
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

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // --- Translation Helpers ---
  const translateStatus = (status: string) => {
    if (!isEn) return status;
    const map: Record<string, string> = {
      '未建档': 'Not Started',
      '规划中': 'Planning',
      '申请中': 'Applying',
      '已Offer': 'Offered',
      '已去向确认': 'Committed'
    };
    return map[status] || status;
  };

  const translateNextTask = (task: string) => {
    if (!isEn) return task;
    const map: Record<string, string> = {
      '选校名单确认': 'School List Confirm',
      '文书终稿审核': 'Essay Review',
      '首次面谈': 'First Meeting',
      '作品集Review': 'Portfolio Review',
      '家长会预约': 'Parent Meeting',
      '建档面谈': 'Onboarding',
      '建档': 'Onboarding'
    };
    return map[task] || task;
  };

  const translateRiskTag = (tag: string) => {
    if (!isEn) return tag;
    const map: Record<string, string> = {
      'GPA波动': 'GPA Fluctuation',
      '托福未达标': 'Low TOEFL',
      '缺课外活动规划': 'Lack of Activities',
      '首谈逾期': 'Meeting Overdue',
      '作品集进度慢': 'Portfolio Delay',
      '家长失联': 'Parent Unreachable',
      '目标过高': 'Target Too High'
    };
    return map[tag] || tag;
  };

  const translateTarget = (summary: string) => {
    if (!isEn) return summary;
    if (summary === '待规划' || summary === '待定') return 'TBD';
    if (summary === '未定') return 'TBD';
    return summary;
  };

  const getRiskBadge = (level: RiskLevel, categories: string[], tags: string[]) => {
    if (level === 'none' || (!categories.length && !tags.length)) return <span className="text-gray-400 dark:text-zinc-600 text-xs">-</span>;
    
    const colors = {
      high: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20',
      medium: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
      low: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20', 
      none: ''
    };

    const translateCat = (cat: string) => {
        if (!isEn) return cat;
        const map: Record<string, string> = { '成绩风险': 'Academic', '目标风险': 'Target', '任务风险': 'Task', '材料风险': 'Material', '沟通风险': 'Comm' };
        return map[cat] || cat;
    };

    return (
      <div className="flex flex-col items-start gap-1">
        <div className="flex flex-wrap gap-1">
           {categories.length > 0 ? (
             categories.map((cat, idx) => (
               <div key={idx} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${colors[level]}`}>
                  <AlertTriangle className="w-3 h-3" />
                  {translateCat(cat)}
               </div>
             ))
           ) : (
             <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${colors[level]}`}>
                <AlertTriangle className="w-3 h-3" />
                {isEn ? 'Alert' : '需关注'}
             </div>
           )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag, i) => (
             <span key={i} className="text-[10px] text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-white/5 px-1.5 rounded">
                {translateRiskTag(tag)}
             </span>
          ))}
        </div>
      </div>
    );
  };

  const getPhaseBadge = (phase: string) => {
     let displayPhase = phase;
     if (isEn) {
         if (phase.includes('建档')) displayPhase = 'Phase 0 Onboarding';
         else if (phase.includes('规划')) displayPhase = 'Phase 1 Planning';
         else if (phase.includes('教学')) displayPhase = 'Phase 2 Tutoring';
         else if (phase.includes('申请')) displayPhase = 'Phase 3 App';
         else if (phase.includes('录取')) displayPhase = 'Phase 4 Admission';
         else if (phase.includes('复盘')) displayPhase = 'Phase 5 Review';
     }
     return <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-400/10 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-500/20 rounded-md text-xs font-medium whitespace-nowrap">{displayPhase}</span>;
  };

  const isAnyFilterActive = isRiskFilterActive || searchQuery || Object.values(filters).some(v => v !== '全部');

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#e5e0dc] dark:border-white/5 flex flex-col h-full min-h-[600px] relative transition-colors duration-300">
      
      {/* Add Student Modal */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-96 overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-white/10" onClick={e => e.stopPropagation()}>
               <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                  <h3 className="font-bold text-gray-800 dark:text-white">{isEn ? 'New Student Profile' : '新建学生档案'}</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors">
                     <XCircle className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">{isEn ? 'Student Name' : '学生姓名'}</label>
                     <input 
                        className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                        value={newStudentForm.name}
                        onChange={(e) => setNewStudentForm({...newStudentForm, name: e.target.value})}
                     />
                  </div>
               </div>
               <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
                  <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">{isEn ? 'Cancel' : '取消'}</button>
                  <button onClick={handleAddStudent} className="px-5 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 shadow-sm transition-all">{isEn ? 'Create' : '确认创建'}</button>
               </div>
            </div>
         </div>
      )}

      {/* Add Communication Modal */}
      {isCommModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-white/10" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary-600" /> {isEn ? 'New Log' : '新增沟通记录'}
                    </h3>
                    <button onClick={() => setIsCommModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">{isEn ? 'Student' : '关联学生'}</label>
                        <select 
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                            value={newCommLog.studentId}
                            onChange={(e) => setNewCommLog({...newCommLog, studentId: e.target.value})}
                        >
                            <option value="">{isEn ? 'Select Student...' : '请选择学生...'}</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">{isEn ? 'Type' : '类型'}</label>
                            <select 
                                className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                                value={newCommLog.type}
                                onChange={(e) => setNewCommLog({...newCommLog, type: e.target.value})}
                            >
                                <option value="Meeting">Meeting {isEn ? '' : '(面谈)'}</option>
                                <option value="Call">Call {isEn ? '' : '(通话)'}</option>
                                <option value="Email">Email {isEn ? '' : '(邮件)'}</option>
                                <option value="WeChat">WeChat {isEn ? '' : '(微信)'}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">{isEn ? 'Time' : '时间'}</label>
                            <input 
                                type="datetime-local"
                                className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                                value={newCommLog.date}
                                onChange={(e) => setNewCommLog({...newCommLog, date: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">{isEn ? 'Participants' : '参与人'}</label>
                        <div className="flex flex-wrap gap-2">
                            {['Student', 'Mom', 'Dad', 'Counselor', 'Tutor'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        const current = newCommLog.participants || [];
                                        const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
                                        setNewCommLog({...newCommLog, participants: next});
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors
                                        ${newCommLog.participants?.includes(p) 
                                        ? 'bg-primary-50 dark:bg-primary-400/10 border-primary-200 dark:border-primary-500/30 text-primary-700 dark:text-primary-300' 
                                        : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600'}
                                    `}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">{isEn ? 'Topic' : '主题摘要'}</label>
                        <input 
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                            placeholder={isEn ? "e.g., G11 Course Selection..." : "例如：G11 选课确认..."}
                            value={newCommLog.title}
                            onChange={(e) => setNewCommLog({...newCommLog, title: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">{isEn ? 'Details' : '详细记录'}</label>
                        <textarea 
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 outline-none h-24 resize-none"
                            placeholder={isEn ? "Enter content..." : "输入沟通内容..."}
                            value={newCommLog.content}
                            onChange={(e) => setNewCommLog({...newCommLog, content: e.target.value})}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
                    <button onClick={() => setIsCommModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">{isEn ? 'Cancel' : '取消'}</button>
                    <button onClick={handleSaveCommLog} className="px-5 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 shadow-sm transition-all">{isEn ? 'Save Log' : '保存记录'}</button>
                </div>
            </div>
        </div>
      )}

      <div className="p-5 border-b border-[#e5e0dc] dark:border-white/5 bg-white dark:bg-zinc-900 rounded-t-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEn ? 'Students' : '学生管理'}</h2>
          <div className="flex gap-3">
             <button 
                onClick={() => setIsCommModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-850 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
             >
                <MessageSquare className="w-4 h-4" /> {isEn ? 'Log Comm' : '新增沟通记录'}
             </button>
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
             >
                <Plus className="w-4 h-4" /> {isEn ? 'New Student' : '新建学生'}
             </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center relative">
           {activeDropdown && (
             <div className="fixed inset-0 z-10 cursor-default" onClick={() => setActiveDropdown(null)}></div>
           )}

           <div className="relative group z-0">
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder={isEn ? "Search Name/ID..." : "搜索姓名/学号..."}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-primary-300 dark:focus:border-primary-700 focus:bg-white dark:focus:bg-zinc-800 transition-all w-64 text-gray-800 dark:text-zinc-200"
             />
             {searchQuery && (
               <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                 <XCircle className="w-3 h-3" />
               </button>
             )}
           </div>
           
           <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

           {(Object.keys(FILTER_CONFIG) as Array<keyof typeof filters>).map((key) => {
             const config = FILTER_CONFIG[key];
             const isActive = filters[key] !== '全部';
             const isOpen = activeDropdown === key;

             return (
               <div key={key as string} className="relative z-20">
                 <button 
                    onClick={() => toggleDropdown(key as string)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition-colors
                      ${isActive || isOpen
                        ? 'bg-primary-50 dark:bg-primary-400/10 border-primary-200 dark:border-primary-500/30 text-primary-800 dark:text-primary-300' 
                        : 'bg-white dark:bg-zinc-850 border-gray-200 dark:border-white/10 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                 >
                    {config.label}: <span className={isActive ? 'font-semibold' : ''}>{filters[key]}</span>
                    {isActive ? (
                        <span onClick={(e) => handleClearDropdownFilter(key, e)} className="hover:text-primary-900 dark:hover:text-primary-200 flex items-center ml-1 p-0.5 rounded-full hover:bg-primary-100/50">
                           <XCircle className="w-3 h-3" />
                        </span>
                    ) : (
                        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                 </button>

                 {isOpen && (
                   <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-lg shadow-lg dark:shadow-black/50 py-1 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto ring-1 ring-black/5 dark:ring-white/5">
                      {config.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleFilterSelect(key, option)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between group"
                        >
                          {option}
                          {filters[key] === option && <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />}
                        </button>
                      ))}
                   </div>
                 )}
               </div>
             );
           })}

           <div className="relative z-20">
             <button 
               onClick={() => toggleDropdown('risk')}
               className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer
                 ${isRiskFilterActive || activeDropdown === 'risk'
                   ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 font-medium ring-2 ring-red-100 dark:ring-red-900/20 ring-offset-1 dark:ring-offset-0' 
                   : 'bg-white dark:bg-zinc-850 border-gray-200 dark:border-white/10 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-white/20'
                 }`}
             >
                {riskFilterLabel} 
                {isRiskFilterActive ? (
                  <span onClick={handleClearRiskFilter} className="hover:text-red-900 dark:hover:text-red-300 flex items-center">
                    <XCircle className="w-3 h-3 ml-1" />
                  </span>
                ) : (
                  <ChevronDown className={`w-3 h-3 opacity-50 ml-1 transition-transform ${activeDropdown === 'risk' ? 'rotate-180' : ''}`} />
                )}
             </button>

             {activeDropdown === 'risk' && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-lg shadow-lg dark:shadow-black/50 py-1 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5 dark:ring-white/5">
                  {RISK_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleRiskSelect(option)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between group"
                    >
                      {option}
                      {activeRiskValue === option && <Check className="w-3 h-3 text-red-600 dark:text-red-400" />}
                    </button>
                  ))}
                </div>
             )}
           </div>
           
           <button className="p-2 text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 custom-scrollbar">
        {filteredStudents.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fbf7f5] dark:bg-zinc-900 sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 dark:border-zinc-700 text-primary-600 bg-white dark:bg-zinc-800 focus:ring-primary-500 cursor-pointer" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{isEn ? 'Student Info' : '学生信息'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{isEn ? 'Phase/Status' : '阶段/状态'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{isEn ? 'Target' : '目标摘要'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{isEn ? 'Risks' : '风险/需关注'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{isEn ? 'Next Task' : '下一步待办'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{isEn ? 'Completion' : '完整度'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">{isEn ? 'Actions' : '操作'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className={`hover:bg-primary-50/30 dark:hover:bg-white/5 transition-colors cursor-pointer group ${selectedIds.has(student.id) ? 'bg-primary-50/20 dark:bg-white/5' : ''}`}
                  onClick={() => onStudentClick(student.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 dark:border-zinc-700 text-primary-600 bg-white dark:bg-zinc-800 focus:ring-primary-500 cursor-pointer"
                      checked={selectedIds.has(student.id)}
                      onChange={(e) => { e.stopPropagation(); handleSelectOne(student.id); }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={student.avatarUrl} 
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{student.grade} {student.class === '待定' ? (isEn ? 'TBD' : '待定') : student.class} • {student.direction}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col items-start gap-1.5">
                        {getPhaseBadge(student.phase)}
                        <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${student.status === '申请中' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                          {translateStatus(student.status)}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-sm text-gray-700 dark:text-zinc-300 font-medium block truncate max-w-[120px]">{translateTarget(student.targetSummary)}</span>
                  </td>
                  <td className="px-6 py-4">
                     {getRiskBadge(student.riskLevel, student.riskCategories, student.riskTags)}
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-sm text-gray-800 dark:text-zinc-200">{translateNextTask(student.nextTask)}</div>
                     <div className={`text-xs mt-0.5 flex items-center gap-1 ${student.nextTaskDue === 'Today' || student.nextTaskDue === 'Overdue' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-zinc-400'}`}>
                        <Clock className="w-3 h-3" /> {student.nextTaskDue}
                     </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                     <div className="flex items-center gap-2">
                       <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.dataCompleteness < 50 ? 'bg-red-400' : 'bg-primary-400'}`} 
                            style={{width: `${student.dataCompleteness}%`}}
                          ></div>
                       </div>
                       <span className="text-xs text-gray-400 dark:text-zinc-500">{student.dataCompleteness}%</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                     <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title={isEn ? "Email" : "发邮件"} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button title={isEn ? "Task" : "创建任务"} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button title={isEn ? "More" : "更多"} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-zinc-400">
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-full mb-3">
              <Search className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium">{isEn ? 'No results found' : '没有找到符合条件的搜索结果'}</p>
            {isAnyFilterActive && (
              <button 
                onClick={handleClearAllFilters} 
                className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                {isEn ? 'Clear filters' : '清除所有筛选'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#e5e0dc] dark:border-white/5 flex justify-between items-center text-sm text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-b-2xl">
         <span>
            {isEn 
              ? `Showing ${filteredStudents.length > 0 ? 1 : 0}-${filteredStudents.length} of ${filteredStudents.length} students` 
              : `显示 ${filteredStudents.length > 0 ? 1 : 0}-${filteredStudents.length} 共 ${filteredStudents.length} 名学生`
            } 
            {selectedIds.size > 0 && <span className="ml-2 font-medium text-primary-600 dark:text-primary-400">({isEn ? 'Selected ' : '已选 '}{selectedIds.size})</span>}
         </span>
         <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 text-gray-700 dark:text-zinc-300">{isEn ? 'Prev' : '上一页'}</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300">{isEn ? 'Next' : '下一页'}</button>
         </div>
      </div>
    </div>
  );
};

export default StudentList;

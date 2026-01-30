
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, Users, GraduationCap, Medal, AlertTriangle, 
  Edit, Plus, Save, X, Upload, Sparkles, Loader2,
  Trash2, TrendingUp, RefreshCw, Calculator, Table, 
  FileText, ChevronDown, ChevronUp, FileSpreadsheet, Eye, Check, CheckCircle, Clock,
  Image as ImageIcon, File as FileIcon, ExternalLink
} from '../common/Icons';
import { StudentSummary } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

interface StudentBasicInfoProps {
  student: StudentSummary;
  onNavigateToTranscript?: () => void;
  // Callback to add verified proofs to materials
  onAddProof?: (fileName: string, type: 'score' | 'activity') => void;
}

// --- Data Types ---

export type GradeScale = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
export type CourseLevel = 'Regular' | 'Honors' | 'AP' | 'IB' | 'Dual';
export type DataStatus = 'Verified' | 'Pending';

export interface Course {
  id: string;
  name: string;
  level: CourseLevel;
  credits: number;
  regularScore: string; 
  examScore: string;    
  finalGrade: GradeScale; 
}

export interface TermTranscript {
  id: string;
  gradeLevel: string; 
  term: string; 
  courses: Course[];
  isExpanded?: boolean;
}

export interface SubjectScore {
  id: string;
  subject: string;
  score: string;
  type: 'AP' | 'IB' | 'IGCSE' | 'TOEFL' | 'SAT' | 'ACT';
  date?: string;
  status: DataStatus; 
  proof?: string; // Proof filename for review
}

export interface Activity {
  id: number;
  title: string;
  role: string;
  level: string;
  hours: string;
  grade: string;
  status: DataStatus; 
  proof?: string; // Proof filename for review
}

// --- Constants ---
const GRADE_POINTS: Record<GradeScale, number> = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0
};

const WEIGHT_ADDONS: Record<CourseLevel, number> = {
  'Regular': 0, 'Honors': 0.5, 'AP': 1.0, 'IB': 1.0, 'Dual': 1.0
};

const DIRECTION_OPTIONS = ['US', 'UK', 'HK', 'SG', 'Canada', 'Australia', 'Europe', 'Global'];
const GRADE_OPTIONS = ['G9', 'G10', 'G11', 'G12'];

const calculateLetter = (reg: string, exam: string): GradeScale => {
  const r = parseFloat(reg);
  const e = parseFloat(exam);
  if (isNaN(r) || isNaN(e)) return 'F'; 
  const final = (r * 0.5) + (e * 0.5);
  if (final >= 93) return 'A';
  if (final >= 90) return 'A-';
  if (final >= 87) return 'B+';
  if (final >= 83) return 'B';
  if (final >= 80) return 'B-';
  if (final >= 77) return 'C+';
  if (final >= 73) return 'C';
  if (final >= 60) return 'D';
  return 'F';
};

// --- Initial Mock Data ---
export const initialTranscript: TermTranscript[] = [
  {
    id: 't1', gradeLevel: 'G9', term: 'Fall', isExpanded: false,
    courses: [
      { id: 'c1', name: 'English Literature I', level: 'Regular', credits: 1, regularScore: '96', examScore: '94', finalGrade: 'A' },
      { id: 'c2', name: 'Algebra II', level: 'Honors', credits: 1, regularScore: '90', examScore: '94', finalGrade: 'A-' },
      { id: 'c3', name: 'Biology', level: 'Regular', credits: 1, regularScore: '88', examScore: '88', finalGrade: 'B+' },
      { id: 'c4', name: 'World History', level: 'Regular', credits: 1, regularScore: '95', examScore: '97', finalGrade: 'A' },
      { id: 'c5', name: 'Spanish I', level: 'Regular', credits: 1, regularScore: '92', examScore: '96', finalGrade: 'A' },
    ]
  },
  {
    id: 't2', gradeLevel: 'G9', term: 'Spring', isExpanded: false,
    courses: [
      { id: 'c6', name: 'English Literature I', level: 'Regular', credits: 1, regularScore: '94', examScore: '92', finalGrade: 'A' },
      { id: 'c7', name: 'Algebra II', level: 'Honors', credits: 1, regularScore: '96', examScore: '94', finalGrade: 'A' },
      { id: 'c8', name: 'Biology', level: 'Regular', credits: 1, regularScore: '90', examScore: '88', finalGrade: 'B+' },
      { id: 'c9', name: 'World History', level: 'Regular', credits: 1, regularScore: '98', examScore: '96', finalGrade: 'A' },
      { id: 'c10', name: 'Spanish I', level: 'Regular', credits: 1, regularScore: '94', examScore: '96', finalGrade: 'A' },
    ]
  },
  {
    id: 't3', gradeLevel: 'G10', term: 'Fall', isExpanded: false,
    courses: [
      { id: 'c11', name: 'English Literature II', level: 'Honors', credits: 1, regularScore: '93', examScore: '95', finalGrade: 'A' },
      { id: 'c12', name: 'Pre-Calculus', level: 'Honors', credits: 1, regularScore: '95', examScore: '97', finalGrade: 'A' },
      { id: 'c13', name: 'Chemistry', level: 'AP', credits: 1, regularScore: '86', examScore: '90', finalGrade: 'B+' },
      { id: 'c14', name: 'AP Human Geography', level: 'AP', credits: 1, regularScore: '90', examScore: '92', finalGrade: 'A-' },
      { id: 'c15', name: 'Spanish II', level: 'Regular', credits: 1, regularScore: '92', examScore: '94', finalGrade: 'A' },
    ]
  },
];

// Added Pending items for demo
export const initialSubjectScores: SubjectScore[] = [
  { id: 's99', subject: 'TOEFL', score: '105', type: 'TOEFL', date: '2024-10-20', status: 'Pending', proof: 'toefl_oct_score.pdf' }, 
  { id: 's1', subject: 'TOEFL', score: '102', type: 'TOEFL', date: '2023-10', status: 'Verified' },
  { id: 's2', subject: 'SAT', score: '1450', type: 'SAT', date: '2023-12', status: 'Verified' },
  { id: 's3', subject: 'Calculus BC', score: '5', type: 'AP', date: '2024-05', status: 'Verified' },
  { id: 's4', subject: 'Physics C: Mech', score: '5', type: 'AP', date: '2024-05', status: 'Verified' },
  { id: 's5', subject: 'Physics C: E&M', score: '4', type: 'AP', date: '2024-05', status: 'Verified' },
];

export const initialActivities: Activity[] = [
  { id: 99, title: 'AI Research Summer Camp', role: 'Team Leader', level: 'National', hours: '40h', grade: '11', status: 'Pending', proof: 'camp_certificate.jpg' }, 
  { id: 1, title: 'School Robotics Club', role: 'Founder & President', level: 'School', hours: '4h/week', grade: '10, 11, 12', status: 'Verified' },
  { id: 2, title: 'AMC 12 Math Competition', role: 'Participant (Distinction)', level: 'National', hours: '-', grade: '11', status: 'Verified' },
  { id: 3, title: 'Community Elderly Care', role: 'Volunteer', level: 'Community', hours: '50h Total', grade: '10, 11', status: 'Verified' },
];

const StudentBasicInfo: React.FC<StudentBasicInfoProps> = ({ student, onNavigateToTranscript, onAddProof }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  // --- State: Modes ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isTranscriptMode, setIsTranscriptMode] = useState(false); 
  const [isEditingTests, setIsEditingTests] = useState(false);
  const [isEditingActivities, setIsEditingActivities] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDirectionDropdownOpen, setIsDirectionDropdownOpen] = useState(false);
  
  // Modal State for Review Workflow
  const [reviewModalState, setReviewModalState] = useState<{ type: 'score' | 'activity', id: string | number } | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const phaseOptions = useMemo(() => isEn ? [
    'Phase 0 Onboarding', 'Phase 1 Planning', 'Phase 2 Tutoring', 'Phase 3 Application', 'Phase 4 Admission', 'Phase 5 Review'
  ] : [
    'Phase 0 建档', 'Phase 1 规划', 'Phase 2 教学运营', 'Phase 3 申请', 'Phase 4 录取', 'Phase 5 复盘'
  ], [isEn]);

  // --- State: Data ---
  const [profileData, setProfileData] = useState({
    school: 'Ascent International School',
    grade: student.grade,
    class: student.class,
    direction: student.direction,
    studentId: student.studentId,
    nationality: isEn ? 'China' : '中国',
    phase: student.phase 
  });

  const [familyData, setFamilyData] = useState({
    budget: isEn ? '500-800k RMB/Yr' : '50-80w RMB/年',
    location: isEn ? 'US East / California' : '美国东海岸 / 加州',
    needs: isEn ? 'Prefer Big U, high CS ranking, safety first.' : '偏好大U，看重计算机排名，城市安全第一。'
  });

  const [transcript, setTranscript] = useState<TermTranscript[]>(initialTranscript);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>(initialSubjectScores);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [notes, setNotes] = useState(isEn 
    ? 'Student is very autonomous but weak in time management. Parents are anxious about rankings. Suggest guiding essay towards "Interdisciplinary Innovation". Note: G10 original transcript not yet submitted.'
    : '学生非常自主，但时间管理较弱。家长比较焦虑排名，需要定期安抚并展示数据。建议文书方向往“跨学科创新”引导。注意：G10成绩单原件尚未提交。');

  const [termToDelete, setTermToDelete] = useState<string | null>(null);

  // --- Calculations ---
  const calculatedStats = useMemo(() => {
    let totalPointsUnweighted = 0;
    let totalPointsWeighted = 0;
    let totalCredits = 0;
    const gpaData: { name: string; gpa: number; weighted: number }[] = [];

    transcript.forEach(term => {
      let termPoints = 0;
      let termPointsW = 0;
      let termCredits = 0;

      term.courses.forEach(c => {
        const basePoint = GRADE_POINTS[c.finalGrade] || 0;
        const weight = WEIGHT_ADDONS[c.level] || 0;
        termPoints += basePoint * c.credits;
        termPointsW += (basePoint + weight) * c.credits;
        termCredits += c.credits;
      });

      const termGpaUnweighted = termCredits > 0 ? (termPoints / termCredits) : 0;
      const termGpaWeighted = termCredits > 0 ? (termPointsW / termCredits) : 0;

      totalPointsUnweighted += termPoints;
      totalPointsWeighted += termPointsW;
      totalCredits += termCredits;

      if (termCredits > 0) {
        gpaData.push({
          name: `${term.gradeLevel} ${term.term}`,
          gpa: parseFloat(termGpaUnweighted.toFixed(2)),
          weighted: parseFloat(termGpaWeighted.toFixed(2))
        });
      }
    });

    return {
      cumUnweighted: totalCredits > 0 ? (totalPointsUnweighted / totalCredits).toFixed(2) : '0.00',
      cumWeighted: totalCredits > 0 ? (totalPointsWeighted / totalCredits).toFixed(2) : '0.00',
      totalCredits,
      gpaData
    };
  }, [transcript]);

  // --- Handlers ---
  const handleToggleTerm = (id: string) => {
    setTranscript(prev => prev.map(t => t.id === id ? { ...t, isExpanded: !t.isExpanded } : t));
  };
  const handleUpdateCourse = (termId: string, courseId: string, field: keyof Course, value: any) => {
    setTranscript(prev => prev.map(t => {
      if (t.id !== termId) return t;
      const newCourses = t.courses.map(c => {
        if (c.id !== courseId) return c;
        const updatedCourse = { ...c, [field]: value };
        if (field === 'regularScore' || field === 'examScore') {
          updatedCourse.finalGrade = calculateLetter(updatedCourse.regularScore, updatedCourse.examScore);
        }
        return updatedCourse;
      });
      return { ...t, courses: newCourses };
    }));
  };
  const handleAddCourse = (termId: string) => {
    setTranscript(prev => prev.map(t => {
      if (t.id !== termId) return t;
      return { ...t, courses: [...t.courses, { id: `new-${Date.now()}`, name: '', level: 'Regular', credits: 1, regularScore: '', examScore: '', finalGrade: 'F' }] };
    }));
  };
  const handleRemoveCourse = (termId: string, courseId: string) => {
    setTranscript(prev => prev.map(t => { if (t.id !== termId) return t; return { ...t, courses: t.courses.filter(c => c.id !== courseId) }; }));
  };
  const handleAddTerm = () => { setTranscript([...transcript, { id: `t-${Date.now()}`, gradeLevel: 'G10', term: 'Spring', courses: [], isExpanded: true }]); };
  const handleUpdateTerm = (id: string, field: 'gradeLevel' | 'term', value: string) => { setTranscript(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t)); };
  const requestDeleteTerm = (e: React.MouseEvent, id: string) => { e.stopPropagation(); e.preventDefault(); setTermToDelete(id); };
  const confirmDeleteTerm = () => { if (termToDelete) { setTranscript(prev => prev.filter(t => t.id !== termToDelete)); setTermToDelete(null); } };
  const handleUpdateSubjectScore = (id: string, field: keyof SubjectScore, value: string) => { setSubjectScores(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s)); };
  const handleAddSubjectScore = () => { setSubjectScores([...subjectScores, { id: `s-${Date.now()}`, subject: 'New Subject', score: '-', type: 'AP', date: '2024', status: 'Verified' }]); };
  const handleRemoveSubjectScore = (id: string) => { setSubjectScores(prev => prev.filter(s => s.id !== id)); };
  const handleUpdateActivity = (id: number, field: keyof Activity, value: string) => { setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a)); };
  const handleAddActivity = () => { setActivities([{ id: Date.now(), title: 'New Activity', role: 'Participant', level: 'School', hours: '1h/wk', grade: '10', status: 'Verified' }, ...activities]); };
  const handleRemoveActivity = (id: number) => { setActivities(prev => prev.filter(a => a.id !== id)); };
  const handleOrganizeActivities = () => { setIsOrganizing(true); setTimeout(() => { setIsOrganizing(false); setActivities([{ id: 99, title: 'AI Research Intern (Extracted)', role: 'Assistant', level: 'Regional', hours: '40h', grade: '11', status: 'Verified' }, ...activities]); }, 1500); };

  // --- Approval Workflow Handlers ---
  const handleApproveScore = (id: string) => {
    setSubjectScores(prev => prev.map(s => s.id === id ? { ...s, status: 'Verified' } : s));
  };
  const handleRejectScore = (id: string) => {
    if (confirm(isEn ? 'Reject and delete this score entry?' : '确认驳回并删除此成绩记录？')) {
      setSubjectScores(prev => prev.filter(s => s.id !== id));
    }
  };
  const handleApproveActivity = (id: number) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'Verified' } : a));
  };
  const handleRejectActivity = (id: number) => {
    if (confirm(isEn ? 'Reject and delete this activity entry?' : '确认驳回并删除此活动记录？')) {
      setActivities(prev => prev.filter(a => a.id !== id));
    }
  };

  const getReviewingItem = () => {
    if (!reviewModalState) return null;
    if (reviewModalState.type === 'score') {
        return subjectScores.find(s => s.id === reviewModalState.id);
    } else {
        return activities.find(a => a.id === reviewModalState.id);
    }
  };

  const handleProcessReview = (action: 'approve' | 'reject') => {
    if (!reviewModalState) return;
    
    const item = getReviewingItem();

    if (action === 'approve') {
      if (reviewModalState.type === 'score') {
         setSubjectScores(prev => prev.map(s => s.id === reviewModalState.id ? { ...s, status: 'Verified' } : s));
      } else {
         setActivities(prev => prev.map(a => a.id === reviewModalState.id ? { ...a, status: 'Verified' } : a));
      }
      
      // Auto-save proof to Materials
      if (item && item.proof && onAddProof) {
          onAddProof(item.proof, reviewModalState.type);
      }

    } else {
      // Reject - simplified for modal flow (delete)
      if (reviewModalState.type === 'score') {
         setSubjectScores(prev => prev.filter(s => s.id !== reviewModalState.id));
      } else {
         setActivities(prev => prev.filter(a => a.id !== reviewModalState.id));
      }
    }
    setReviewModalState(null);
  };

  const reviewingItem = getReviewingItem();

  const pendingCount = subjectScores.filter(s => s.status === 'Pending').length + activities.filter(a => a.status === 'Pending').length;

  return (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 h-full overflow-y-auto pr-2 pb-10 relative min-h-0">
        
        {/* Pending Alerts Banner */}
        {pendingCount > 0 && (
           <div className="lg:col-span-3 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5 text-orange-600" />
                 <span className="text-sm font-bold text-orange-800">
                    {isEn ? `You have ${pendingCount} pending updates to review.` : `您有 ${pendingCount} 条来自学生的更新申请待审核。`}
                 </span>
              </div>
              <span className="text-xs text-orange-600 bg-white px-2 py-1 rounded border border-orange-100">Action Required</span>
           </div>
        )}

        {/* Review Modal */}
        {reviewingItem && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setReviewModalState(null)}>
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-[600px] max-w-[95%] m-4 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                 {/* Header */}
                 <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                       <CheckCircle className="w-5 h-5 text-primary-600" /> {isEn ? 'Review Request' : '审核申请'}
                    </h3>
                    <button onClick={() => setReviewModalState(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 {/* Content */}
                 <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Item Details */}
                    <div className="mb-6">
                       <h4 className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase mb-3 tracking-wider">{isEn ? 'Item Details' : '申请内容详情'}</h4>
                       <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 border border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
                          {'subject' in reviewingItem ? (
                             // Score Details
                             <>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Subject' : '科目'}</p>
                                   <p className="font-bold text-gray-900 dark:text-white text-sm">{reviewingItem.subject}</p>
                                </div>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Score' : '分数'}</p>
                                   <p className="font-bold text-primary-600 dark:text-primary-400 text-lg">{reviewingItem.score}</p>
                                </div>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Type' : '类型'}</p>
                                   <p className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{reviewingItem.type}</p>
                                </div>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Date' : '考试日期'}</p>
                                   <p className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{reviewingItem.date}</p>
                                </div>
                             </>
                          ) : (
                             // Activity Details
                             <>
                                <div className="col-span-2">
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Title' : '活动名称'}</p>
                                   <p className="font-bold text-gray-900 dark:text-white text-sm">{reviewingItem.title}</p>
                                </div>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Role' : '角色'}</p>
                                   <p className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{reviewingItem.role}</p>
                                </div>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Level' : '级别'}</p>
                                   <p className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{reviewingItem.level}</p>
                                </div>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Hours' : '时长'}</p>
                                   <p className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{reviewingItem.hours}</p>
                                </div>
                                <div>
                                   <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">{isEn ? 'Grade' : '年级'}</p>
                                   <p className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{reviewingItem.grade}</p>
                                </div>
                             </>
                          )}
                       </div>
                    </div>

                    {/* Proof Preview */}
                    <div>
                       <h4 className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                          {isEn ? 'Proof of Evidence' : '佐证材料'}
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-normal normal-case">File Attached</span>
                       </h4>
                       <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-white/5 p-8 flex flex-col items-center justify-center text-center relative group overflow-hidden">
                          {reviewingItem.proof ? (
                             <>
                                <div className="w-16 h-16 bg-white dark:bg-zinc-700 rounded-xl shadow-sm flex items-center justify-center mb-3">
                                   <ImageIcon className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                                </div>
                                <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">{reviewingItem.proof}</p>
                                <button className="mt-4 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                                   <ExternalLink className="w-3 h-3" /> {isEn ? 'Open Full Preview' : '查看完整大图'}
                                </button>
                             </>
                          ) : (
                             <div className="text-gray-400 dark:text-zinc-500 text-sm flex flex-col items-center">
                                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                                {isEn ? 'No proof attached' : '未上传证明材料'}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="p-6 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-white/5 flex gap-4">
                    <button 
                       onClick={() => handleProcessReview('reject')}
                       className="flex-1 py-3 border border-red-200 dark:border-red-500/20 bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                       <X className="w-4 h-4" /> {isEn ? 'Reject' : '驳回申请'}
                    </button>
                    <button 
                       onClick={() => handleProcessReview('approve')}
                       className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                    >
                       <Check className="w-5 h-5" /> {isEn ? 'Verify & Approve' : '确认无误，通过审核'}
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* Delete Confirmation Modal */}
        {termToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setTermToDelete(null)}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90%] m-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{isEn ? 'Delete Term?' : '确认删除学期？'}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {isEn ? 'This action will permanently delete this term and all its courses. This cannot be undone.' : '该操作将永久删除此学期及其包含的所有课程数据，无法撤销。'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setTermToDelete(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  {isEn ? 'Cancel' : '取消'}
                </button>
                <button 
                  onClick={confirmDeleteTerm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors"
                >
                  {isEn ? 'Delete' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- LEFT COLUMN: Profile & Family --- */}
        <div className="space-y-6 min-w-0">
           
           {/* 1. Basic Profile */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e5e0dc] transition-all hover:shadow-md">
               {/* ... Profile Content (Same as before) ... */}
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <User className="w-4 h-4 text-primary-600" /> {isEn ? 'Basic Profile' : '基础资料'}
                  </h3>
                  {isEditingProfile ? (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingProfile(false)} className="text-xs text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                      <button onClick={() => setIsEditingProfile(false)} className="text-xs text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <button onClick={() => setIsEditingProfile(true)} className="text-xs text-primary-600 hover:underline"><Edit className="w-3 h-3"/></button>
                  )}
               </div>
               
               <div className="space-y-3 text-sm">
                  {[
                    { label: isEn ? 'School' : '学校', key: 'school' },
                    { label: isEn ? 'Grade' : '年级', key: 'grade' },
                    { label: isEn ? 'Direction' : '方向', key: 'direction' },
                    { label: isEn ? 'Student ID' : '学号', key: 'studentId' },
                    { label: isEn ? 'Nationality' : '国籍', key: 'nationality' },
                    { label: isEn ? 'Phase' : '当前阶段', key: 'phase' }
                  ].map(({ label, key }) => (
                    <div key={key} className="flex justify-between border-b border-dashed border-gray-100 pb-2 items-center min-h-[32px]">
                       <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
                       {isEditingProfile ? (
                         key === 'phase' ? (
                           <select 
                             className="text-right font-medium text-gray-900 border-b border-primary-300 focus:border-primary-600 outline-none w-full bg-transparent py-0.5 cursor-pointer"
                             value={profileData[key as keyof typeof profileData]}
                             onChange={(e) => setProfileData({...profileData, [key]: e.target.value as any})}
                           >
                             {phaseOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                         ) : key === 'direction' ? (
                            <div className="relative w-full">
                                <div 
                                    className="flex flex-wrap justify-end gap-1 cursor-pointer border-b border-primary-300 min-h-[24px] pb-0.5"
                                    onClick={() => setIsDirectionDropdownOpen(!isDirectionDropdownOpen)}
                                >
                                    {profileData.direction.split(',').filter(Boolean).length > 0 ? (
                                        profileData.direction.split(',').filter(Boolean).map(d => (
                                            <span key={d} className="bg-primary-100 text-primary-800 text-[10px] px-1.5 py-0.5 rounded font-medium">{d.trim()}</span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs">{isEn ? 'Select...' : '选择方向...'}</span>
                                    )}
                                </div>
                                
                                {isDirectionDropdownOpen && (
                                    <>
                                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDirectionDropdownOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="space-y-1">
                                            {DIRECTION_OPTIONS.map(opt => {
                                                const selected = profileData.direction.includes(opt);
                                                return (
                                                    <div 
                                                        key={opt} 
                                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const current = profileData.direction.split(',').map(s => s.trim()).filter(Boolean);
                                                            let newDirs;
                                                            if (selected) {
                                                                newDirs = current.filter(c => c !== opt);
                                                            } else {
                                                                newDirs = [...current, opt];
                                                            }
                                                            setProfileData({...profileData, direction: newDirs.join(',')});
                                                        }}
                                                    >
                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                                                            {selected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <span className="text-sm text-gray-700">{opt}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="border-t mt-2 pt-2 text-right">
                                             <button onClick={(e) => { e.stopPropagation(); setIsDirectionDropdownOpen(false); }} className="text-xs text-primary-600 font-bold hover:text-primary-800">{isEn ? 'Done' : '完成'}</button>
                                        </div>
                                    </div>
                                    </>
                                )}
                            </div>
                         ) : key === 'grade' ? (
                            <select 
                              className="text-right font-medium text-gray-900 border-b border-primary-300 focus:border-primary-600 outline-none w-full bg-transparent py-0.5 cursor-pointer"
                              value={profileData[key as keyof typeof profileData]}
                              onChange={(e) => setProfileData({...profileData, [key]: e.target.value})}
                            >
                              {GRADE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                         ) : (
                           <input 
                             className="text-right font-medium text-gray-900 border-b border-primary-300 focus:border-primary-600 outline-none w-full bg-transparent"
                             value={profileData[key as keyof typeof profileData]}
                             onChange={(e) => setProfileData({...profileData, [key]: e.target.value})}
                           />
                         )
                       ) : (
                         key === 'direction' ? (
                            <div className="flex justify-end gap-1 flex-wrap">
                                {profileData.direction.split(',').filter(Boolean).map(d => (
                                   <span key={d} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700 font-bold border border-gray-200">{d.trim()}</span>
                                ))}
                            </div>
                         ) : (
                            <span className="text-gray-900 font-medium text-right w-full">{profileData[key as keyof typeof profileData]}</span>
                         )
                       )}
                    </div>
                  ))}
               </div>
           </div>
           
           {/* 2. Family Preferences */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e5e0dc] transition-all hover:shadow-md">
               {/* ... Family Content ... */}
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <Users className="w-4 h-4 text-primary-600" /> {isEn ? 'Family Preferences' : '家庭偏好与约束'}
                  </h3>
                  {isEditingFamily ? (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingFamily(false)} className="text-xs text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                      <button onClick={() => setIsEditingFamily(false)} className="text-xs text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <button onClick={() => setIsEditingFamily(true)} className="text-xs text-primary-600 hover:underline"><Edit className="w-3 h-3"/></button>
                  )}
               </div>

               <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <p className="text-xs text-gray-500 mb-1">{isEn ? 'Budget Range' : '预算范围'}</p>
                     {isEditingFamily ? (
                       <input className="w-full text-sm font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1" value={familyData.budget} onChange={e => setFamilyData({...familyData, budget: e.target.value})} />
                     ) : (
                       <p className="text-sm font-bold text-gray-800">{familyData.budget}</p>
                     )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <p className="text-xs text-gray-500 mb-1">{isEn ? 'Location' : '地理偏好'}</p>
                     {isEditingFamily ? (
                       <input className="w-full text-sm font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1" value={familyData.location} onChange={e => setFamilyData({...familyData, location: e.target.value})} />
                     ) : (
                       <p className="text-sm font-bold text-gray-800">{familyData.location}</p>
                     )}
                  </div>
               </div>
           </div>

           {/* 5. Teacher Notes */}
           <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 relative overflow-hidden transition-all hover:shadow-md">
               {/* ... Notes Content ... */}
               <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-yellow-800 flex items-center gap-2 text-sm">
                     <AlertTriangle className="w-4 h-4" /> {isEn ? 'Counselor Notes' : '升学顾问备注'}
                  </h3>
                  {isEditingNotes ? (
                     <div className="flex gap-2">
                        <button onClick={() => setIsEditingNotes(false)} className="text-xs text-yellow-600 hover:text-yellow-800"><X className="w-4 h-4"/></button>
                        <button onClick={() => setIsEditingNotes(false)} className="text-xs text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></button>
                     </div>
                  ) : (
                     <button onClick={() => setIsEditingNotes(true)} className="text-xs text-yellow-700 hover:underline"><Edit className="w-3 h-3"/></button>
                  )}
               </div>
               {isEditingNotes ? (
                  <textarea 
                     className="w-full bg-yellow-50/50 border border-yellow-200 rounded p-2 text-sm text-yellow-900 focus:ring-1 focus:ring-yellow-400 outline-none"
                     rows={4}
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                  />
               ) : (
                  <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">
                     {notes}
                  </p>
               )}
            </div>
        </div>

        {/* --- MIDDLE & RIGHT COLUMN --- */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
           
           {/* 3. Transcript Builder (Existing code) */}
           <div className="bg-white rounded-xl shadow-sm border border-[#e5e0dc] transition-all hover:shadow-md overflow-hidden flex flex-col">
               {/* ... (Same Chart & Table logic) ... */}
               {/* Header */}
               <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <GraduationCap className="w-5 h-5 text-primary-600" /> {isEn ? 'Transcript Builder' : '学术成绩单 (Transcript Builder)'}
                  </h3>
                  <div className="flex items-center gap-2">
                     {!isTranscriptMode && (
                        <button 
                           onClick={onNavigateToTranscript}
                           className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-colors"
                        >
                           <FileText className="w-3.5 h-3.5" /> {isEn ? 'Preview PDF' : '预览 PDF'}
                        </button>
                     )}
                     <button 
                        onClick={() => setIsTranscriptMode(!isTranscriptMode)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                           ${isTranscriptMode ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'}
                        `}
                     >
                        {isTranscriptMode ? <Save className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                        {isTranscriptMode ? (isEn ? 'Done Editing' : '完成编辑') : (isEn ? 'Edit Grades' : '编辑成绩')}
                     </button>
                  </div>
               </div>

               {/* New Stats Summary Bar: Chart & Total GPA */}
               <div className="flex flex-col md:flex-row border-b border-gray-100 min-h-[220px] flex-shrink-0">
                  {/* Left: Trend Chart */}
                  <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col min-w-0">
                     <div className="flex justify-between items-center mb-2 flex-shrink-0">
                        <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                           <TrendingUp className="w-3 h-3"/> {isEn ? 'GPA Trend' : '学期成绩趋势 (GPA Trend)'}
                        </p>
                     </div>
                     <div className="flex-1 w-full relative min-h-0 min-w-0" style={{ minHeight: '150px' }}>
                        <ResponsiveContainer width="100%" height="100%" debounce={300}>
                           <AreaChart data={calculatedStats.gpaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                 <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#b0826d" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#b0826d" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                              <Tooltip 
                                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                 cursor={{ stroke: '#b0826d', strokeWidth: 1, strokeDasharray: '3 3' }}
                              />
                              <Area type="monotone" dataKey="weighted" stroke="#b0826d" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" activeDot={{ r: 6, strokeWidth: 0 }} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Right: Total GPA */}
                  <div className="w-full md:w-56 p-6 flex flex-col justify-center items-center bg-gray-50/30 flex-shrink-0">
                     <p className="text-xs font-bold text-gray-400 uppercase mb-3">Cumulative GPA</p>
                     <div className="text-center">
                        <p className="text-5xl font-bold text-primary-700 leading-none mb-1">{calculatedStats.cumWeighted}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-bold">Weighted</span>
                     </div>
                     <div className="mt-4 pt-4 border-t border-gray-200 w-full text-center">
                        <p className="text-xl font-bold text-gray-600">{calculatedStats.cumUnweighted}</p>
                        <p className="text-[10px] text-gray-400">Unweighted (4.0)</p>
                     </div>
                  </div>
               </div>

               {/* Transcript Body */}
               <div className="p-5 bg-gray-50/50 space-y-4 max-h-[500px] overflow-y-auto min-h-0">
                  {transcript.map((term) => (
                     <div key={term.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div 
                           className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                           onClick={() => handleToggleTerm(term.id)}
                        >
                           <div className="flex items-center gap-3">
                              {term.isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                              {isTranscriptMode ? (
                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                  <input 
                                    className="w-16 bg-white border border-gray-300 rounded px-1 text-sm font-bold text-gray-800 focus:border-primary-500 outline-none"
                                    value={term.gradeLevel}
                                    onChange={(e) => handleUpdateTerm(term.id, 'gradeLevel', e.target.value)}
                                  />
                                  <span className="text-gray-400">-</span>
                                  <input 
                                    className="w-20 bg-white border border-gray-300 rounded px-1 text-sm font-bold text-gray-800 focus:border-primary-500 outline-none"
                                    value={term.term}
                                    onChange={(e) => handleUpdateTerm(term.id, 'term', e.target.value)}
                                  />
                                </div>
                              ) : (
                                <span className="font-bold text-gray-800 text-sm">{term.gradeLevel} - {term.term}</span>
                              )}
                              
                              {!isTranscriptMode && (
                                <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                   {term.courses.length} Courses
                                </span>
                              )}
                           </div>
                           
                           {isTranscriptMode && (
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <button 
                                  type="button"
                                  onClick={(e) => requestDeleteTerm(e, term.id)} 
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" 
                                  title={isEn ? "Delete Term" : "删除学期"}
                                >
                                   <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                                <button onClick={(e) => {e.stopPropagation(); handleAddCourse(term.id)}} className="text-xs text-primary-600 font-bold hover:bg-primary-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                                   <Plus className="w-3 h-3 text-gray-300 transition-colors cursor-pointer group-hover:text-primary-500"/> {isEn ? 'Add Course' : '添加课程'}
                                </button>
                              </div>
                           )}
                        </div>

                        {term.isExpanded && (
                           <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                 <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase font-medium">
                                    <tr>
                                       <th className="px-4 py-2 w-1/3">Course Name</th>
                                       <th className="px-4 py-2 w-20">Level</th>
                                       <th className="px-4 py-2 w-20 text-center">{isEn ? 'Regular (50%)' : '平时成绩 (50%)'}</th>
                                       <th className="px-4 py-2 w-20 text-center">{isEn ? 'Exam (50%)' : '考试成绩 (50%)'}</th>
                                       <th className="px-4 py-2 w-20 text-center">{isEn ? 'Final (Letter)' : '最终成绩 (Letter)'}</th>
                                       {isTranscriptMode && <th className="px-4 py-2 w-10"></th>}
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {term.courses.map(course => (
                                       <tr key={course.id} className="group hover:bg-gray-50/50 transition-colors">
                                          <td className="px-4 py-2">
                                             {isTranscriptMode ? (
                                                <input 
                                                   className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm focus:bg-white focus:border-primary-400 outline-none"
                                                   value={course.name}
                                                   onChange={(e) => handleUpdateCourse(term.id, course.id, 'name', e.target.value)}
                                                   placeholder="Course Name"
                                                />
                                             ) : (
                                                <span className="text-gray-800 font-medium">{course.name}</span>
                                             )}
                                          </td>
                                          <td className="px-4 py-2">
                                             {isTranscriptMode ? (
                                                <select 
                                                   className="w-full bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs focus:bg-white outline-none"
                                                   value={course.level}
                                                   onChange={(e) => handleUpdateCourse(term.id, course.id, 'level', e.target.value)}
                                                >
                                                   <option value="Regular">Regular</option>
                                                   <option value="Honors">Honors</option>
                                                   <option value="AP">AP</option>
                                                   <option value="IB">IB</option>
                                                </select>
                                             ) : (
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${course.level === 'AP' ? 'bg-orange-50 text-orange-700 border-orange-100' : course.level === 'Honors' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                   {course.level}
                                                </span>
                                             )}
                                          </td>
                                          
                                          <td className="px-4 py-2 text-center">
                                             {isTranscriptMode ? (
                                                <input 
                                                   className="w-16 text-center bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs focus:bg-white outline-none"
                                                   value={course.regularScore}
                                                   onChange={(e) => handleUpdateCourse(term.id, course.id, 'regularScore', e.target.value)}
                                                   placeholder="0-100"
                                                />
                                             ) : (
                                                <span className="text-gray-500">{course.regularScore}</span>
                                             )}
                                          </td>

                                          <td className="px-4 py-2 text-center">
                                             {isTranscriptMode ? (
                                                <input 
                                                   className="w-16 text-center bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs focus:bg-white outline-none"
                                                   value={course.examScore}
                                                   onChange={(e) => handleUpdateCourse(term.id, course.id, 'examScore', e.target.value)}
                                                   placeholder="0-100"
                                                />
                                             ) : (
                                                <span className="text-gray-500">{course.examScore}</span>
                                             )}
                                          </td>

                                          <td className="px-4 py-2 text-center">
                                             <span className={`font-bold ${['A','A-'].includes(course.finalGrade) ? 'text-green-600' : ['B+','B','B-'].includes(course.finalGrade) ? 'text-primary-600' : 'text-orange-500'}`}>
                                                {course.finalGrade}
                                             </span>
                                          </td>

                                          {isTranscriptMode && (
                                             <td className="px-4 py-2 text-center">
                                                <button onClick={() => handleRemoveCourse(term.id, course.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                   <Trash2 className="w-3.5 h-3.5"/>
                                                </button>
                                             </td>
                                          )}
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                              {term.courses.length === 0 && (
                                 <div className="p-4 text-center text-xs text-gray-400">{isEn ? 'No courses found' : '暂无课程记录'}</div>
                              )}
                           </div>
                        )}
                     </div>
                  ))}
                  
                  {isTranscriptMode && (
                     <button onClick={handleAddTerm} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> {isEn ? 'Add New Term' : '添加新学期'}
                     </button>
                  )}
               </div>
           </div>

           {/* 4. Standardized Tests & Activities (Side-by-Side) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
               {/* Tests */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e5e0dc] transition-all hover:shadow-md flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                        <Table className="w-4 h-4 text-primary-600" /> {isEn ? 'Standardized Tests' : '标化考试'}
                     </h3>
                     {isEditingTests ? (
                        <div className="flex gap-2">
                           <button onClick={() => setIsEditingTests(false)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><X className="w-3 h-3"/> {isEn ? 'Cancel' : '取消'}</button>
                           <button onClick={() => setIsEditingTests(false)} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"><Save className="w-3 h-3"/> {isEn ? 'Save' : '保存'}</button>
                        </div>
                     ) : (
                        <button onClick={() => setIsEditingTests(true)} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Edit className="w-3 h-3"/> {isEn ? 'Edit' : '编辑'}</button>
                     )}
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto pr-1 min-h-0">
                     {subjectScores.map(score => (
                        <div key={score.id} className={`flex justify-between items-center p-2.5 rounded-lg border group ${score.status === 'Pending' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                           {isEditingTests ? (
                              <div className="flex-1 grid grid-cols-3 gap-2">
                                 <input 
                                    className="bg-white border border-gray-200 rounded px-1.5 py-1 text-xs outline-none focus:border-primary-400 w-full"
                                    value={score.subject}
                                    onChange={(e) => handleUpdateSubjectScore(score.id, 'subject', e.target.value)}
                                    placeholder="Subject"
                                 />
                                 <input 
                                    className="bg-white border border-gray-200 rounded px-1.5 py-1 text-xs outline-none focus:border-primary-400 w-full"
                                    value={score.date}
                                    onChange={(e) => handleUpdateSubjectScore(score.id, 'date', e.target.value)}
                                    placeholder="Date"
                                 />
                                 <input 
                                    className="bg-white border border-gray-200 rounded px-1.5 py-1 text-xs outline-none focus:border-primary-400 font-bold text-primary-700 w-full"
                                    value={score.score}
                                    onChange={(e) => handleUpdateSubjectScore(score.id, 'score', e.target.value)}
                                    placeholder="Score"
                                 />
                              </div>
                           ) : (
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-800 truncate">{score.subject}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${score.type === 'AP' ? 'bg-orange-50 text-orange-700 border-orange-100' : score.type === 'IB' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{score.type}</span>
                                    {score.status === 'Pending' ? (
                                       <button onClick={() => setReviewModalState({type: 'score', id: score.id})} className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded border border-orange-200 font-bold hover:bg-orange-200 transition-colors flex items-center gap-1">
                                          Review Request
                                       </button>
                                    ) : (
                                       // No review for verified items in this view
                                       null
                                    )}
                                 </div>
                                 <p className="text-[10px] text-gray-400">{score.date}</p>
                              </div>
                           )}
                           
                           {isEditingTests ? (
                              <button onClick={() => handleRemoveSubjectScore(score.id)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                                 <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                           ) : (
                              <div className="flex items-center gap-2">
                                 <span className="text-sm font-bold text-primary-700 flex-shrink-0">{score.score}</span>
                                 {score.status === 'Verified' && <span title="Verified" className="flex"><CheckCircle className="w-3.5 h-3.5 text-green-500" /></span>}
                              </div>
                           )}
                        </div>
                     ))}
                     {isEditingTests && (
                        <button onClick={handleAddSubjectScore} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center justify-center gap-1">
                           <Plus className="w-3 h-3"/> {isEn ? 'Add Score' : '添加考试'}
                        </button>
                     )}
                  </div>
               </div>

               {/* Activities */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e5e0dc] transition-all hover:shadow-md flex flex-col relative overflow-hidden min-h-0">
                  <div className="flex justify-between items-center mb-4 relative z-10 flex-shrink-0">
                     <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                        <Medal className="w-4 h-4 text-primary-600" /> {isEn ? 'Activities' : '活动列表'}
                     </h3>
                     <div className="flex items-center gap-2">
                        {isEditingActivities ? (
                           <>
                              <button onClick={() => setIsEditingActivities(false)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><X className="w-3 h-3"/> {isEn ? 'Cancel' : '取消'}</button>
                              <button onClick={() => setIsEditingActivities(false)} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"><Save className="w-3 h-3"/> {isEn ? 'Save' : '保存'}</button>
                           </>
                        ) : (
                           <>
                              <button onClick={() => setIsEditingActivities(true)} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mr-2"><Edit className="w-3 h-3"/> {isEn ? 'Edit' : '编辑'}</button>
                              <button 
                                 onClick={handleOrganizeActivities}
                                 className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                              >
                                 {isOrganizing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                                 {isOrganizing ? (isEn ? 'Organizing...' : '整理中...') : (isEn ? 'AI Organize' : 'AI 整理')}
                              </button>
                           </>
                        )}
                     </div>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 relative z-10 min-h-0">
                     {activities.map(act => (
                        <div key={act.id} className={`p-3 border rounded-lg hover:border-primary-200 transition-colors cursor-default group ${act.status === 'Pending' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                           {isEditingActivities ? (
                              <div className="space-y-2">
                                 <div className="flex gap-2">
                                    <input 
                                       className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold text-gray-800 outline-none focus:border-primary-400"
                                       value={act.title}
                                       onChange={(e) => handleUpdateActivity(act.id, 'title', e.target.value)}
                                       placeholder="Title"
                                    />
                                    <input 
                                       className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-[10px] text-gray-500 outline-none focus:border-primary-400"
                                       value={act.grade}
                                       onChange={(e) => handleUpdateActivity(act.id, 'grade', e.target.value)}
                                       placeholder="Grade"
                                    />
                                    <button onClick={() => handleRemoveActivity(act.id)} className="text-gray-300 hover:text-red-500">
                                       <Trash2 className="w-3.5 h-3.5"/>
                                    </button>
                                 </div>
                                 <div className="flex gap-2">
                                    <input 
                                       className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-[10px] text-gray-600 outline-none focus:border-primary-400"
                                       value={act.role}
                                       onChange={(e) => handleUpdateActivity(act.id, 'role', e.target.value)}
                                       placeholder="Role"
                                    />
                                    <input 
                                       className="w-24 bg-white border border-gray-200 rounded px-2 py-1 text-[10px] text-gray-600 outline-none focus:border-primary-400"
                                       value={act.hours}
                                       onChange={(e) => handleUpdateActivity(act.id, 'hours', e.target.value)}
                                       placeholder="Hours"
                                    />
                                 </div>
                              </div>
                           ) : (
                              <>
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-gray-800 line-clamp-1">{act.title}</span>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] text-gray-500 flex-shrink-0">{act.grade}</span>
                                       {act.status === 'Pending' ? (
                                          <button onClick={() => setReviewModalState({type: 'activity', id: act.id})} className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded border border-orange-200 font-bold hover:bg-orange-200 transition-colors flex items-center gap-1">
                                             Review Request
                                          </button>
                                       ) : (
                                          <span title="Verified" className="flex"><CheckCircle className="w-3.5 h-3.5 text-green-500" /></span>
                                       )}
                                    </div>
                                 </div>
                                 <p className="text-[10px] text-gray-600 truncate">{act.role} • {act.hours}</p>
                                 {act.status === 'Pending' && <div className="mt-1 text-[9px] text-orange-600 flex items-center gap-1"><Upload className="w-2.5 h-2.5"/> Proof Attached</div>}
                              </>
                           )}
                        </div>
                     ))}
                     {isEditingActivities && (
                        <button onClick={handleAddActivity} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center justify-center gap-1">
                           <Plus className="w-3 h-3"/> {isEn ? 'Add Activity' : '添加活动'}
                        </button>
                     )}
                  </div>

                  {/* Decorative Blob */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl z-0 pointer-events-none"></div>
               </div>
           </div>

        </div>
     </div>
  );
};

export default StudentBasicInfo;


import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, FolderOpen, 
  Compass, FileText, Quote, Trophy, TrendingDown,
  Clock, Paperclip, MessageCircle,
  Zap, AlertCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, CheckCircle, XCircle
} from '../common/Icons';
import { aiService } from '../../utils/ai';
import { cn } from '../../utils/cn';
// Fixed: Removed 'Type' which is not exported from types.ts
import { DetailTab, RiskLevel } from '../../types';
// Fixed: Import MOCK_STUDENTS from staticData instead of missing export in StudentList
import { MOCK_STUDENTS } from '../../data/staticData';
import StudentBasicInfo from './StudentBasicInfo';
import StudentMaterials, { INITIAL_FILES, FileItem } from './StudentMaterials';
import StudentPlanning from './StudentPlanning';
import StudentEssays from './StudentEssays';
import StudentRecommendations from './StudentRecommendations';
import StudentOfferTracking from './StudentOfferTracking';
import StudentCommunication from './StudentCommunication';
import { useLanguage } from '../../contexts/LanguageContext';

interface StudentDetailProps {
  onBack: () => void;
  onNavigateToTranscript: (studentId: string) => void;
}

interface RiskDimension {
  id: string;
  label: string;
  icon: React.ElementType;
  level: RiskLevel | 'unknown';
  statusText: string; 
  evidence: string;
  action: string;
  trend: 'up' | 'down' | 'stable';
}

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
    <CheckCircle className="w-4 h-4 text-green-400" />
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircle className="w-3 h-3" /></button>
  </div>
);

const StudentDetail: React.FC<StudentDetailProps> = ({ onBack, onNavigateToTranscript }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('BasicInfo');
  const [isPanelExpanded, setIsPanelExpanded] = useState(false); 
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [materialFiles, setMaterialFiles] = useState<FileItem[]>(INITIAL_FILES);

  const { language } = useLanguage();
  const isEn = language === 'en-US';
  
  // Fixed: Using MOCK_STUDENTS for lookups
  const student = MOCK_STUDENTS.find(s => s.id === id);

  const initialRisks: RiskDimension[] = useMemo(() => [
    { 
      id: 'academic', label: isEn ? 'Academic' : '学术', icon: TrendingDown, level: 'high', statusText: isEn ? 'Grade Drop' : '成绩异常下滑',
      evidence: isEn ? 'GPA dropped by 0.3; TOEFL stalled.' : 'GPA 下滑 0.3；TOEFL 停滞。', 
      action: isEn ? 'Schedule review.' : '安排学术面谈。', trend: 'down'
    },
    { 
      id: 'target', label: isEn ? 'Target' : '目标', icon: Compass, level: 'medium', statusText: isEn ? 'Aggressive' : '选校方案激进',
      evidence: isEn ? '90% Reach schools.' : '选校清单中 Reach 校占比达 90%。', 
      action: isEn ? 'Add safety schools.' : '建议添加保底院校。', trend: 'stable'
    },
    { id: 'task', label: isEn ? 'Task' : '任务', icon: Clock, level: 'none', statusText: isEn ? 'On Track' : '进度正常', evidence: '', action: '', trend: 'up' },
    { id: 'material', label: isEn ? 'Material' : '材料', icon: Paperclip, level: 'low', statusText: isEn ? 'Rec Pending' : '推荐信待催办', evidence: '', action: '', trend: 'down' },
    { id: 'comm', label: isEn ? 'Comm' : '沟通', icon: MessageCircle, level: 'high', statusText: isEn ? 'Disengaged' : '互动断连', evidence: '', action: '', trend: 'down' },
  ], [isEn]);

  const [riskDimensions, setRiskDimensions] = useState<RiskDimension[]>(initialRisks);

  const handleDeepDiagnosis = async () => {
    if (!student) return;
    setIsDiagnosing(true);
    setIsPanelExpanded(true); 
    try {
      const response = await aiService.generateJSON(
        `Diagnose student ${student.name} application dimensions based on these metrics: GPA 3.8, TOEFL 92. Provide risk levels and brief evidence.`,
        {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              label: { type: "STRING" },
              level: { type: "STRING" },
              statusText: { type: "STRING" }
            }
          }
        }
      );
      
      if (response) {
        const mappedData = response.map((item: any) => ({
          ...item,
          icon: TrendingDown 
        }));
        setRiskDimensions(mappedData);
      }
    } catch (error) {
      console.error(error);
    } finally { setIsDiagnosing(false); }
  };

  const handleAddVerifiedProof = (fileName: string, type: 'score' | 'activity') => {
      const newFile: FileItem = {
          id: `proof-${Date.now()}`, name: fileName, date: new Date().toISOString().split('T')[0],
          size: '0.5MB', category: type === 'score' ? 'certs' : 'activities',
          type: 'pdf', uploader: 'Teacher'
      };
      setMaterialFiles(prev => [newFile, ...prev]);
      setToastMessage(isEn ? "Proof verified & saved" : "证明材料已核验并归档");
  };

  if (!student) return <div className="p-8 h-full flex items-center justify-center text-gray-500">{isEn ? 'Student not found.' : '未找到该学生信息。'}</div>;

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'BasicInfo', label: isEn ? '1. Basic Info' : '1. 基础信息', icon: <User className="w-4 h-4" /> },
    { id: 'Materials', label: isEn ? '2. Materials' : '2. 申请资料夹', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'Planning', label: isEn ? '3. Planning' : '3. 升学规划', icon: <Compass className="w-4 h-4" /> },
    { id: 'Essays', label: isEn ? '4. Essays' : '4. 文书助手', icon: <FileText className="w-4 h-4" /> },
    { id: 'Recommendations', label: isEn ? '5. Recommendations' : '5. 推荐信助手', icon: <Quote className="w-4 h-4" /> },
    { id: 'OfferTracking', label: isEn ? '6. Offers' : '6. Offer追踪', icon: <Trophy className="w-4 h-4" /> },
    { id: 'Communication', label: isEn ? '7. Communication' : '7. 沟通记录', icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f9f8f6] dark:bg-zinc-950 transition-colors duration-300 relative">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <header className="bg-white dark:bg-zinc-900 border-b border-[#e5e0dc] dark:border-white/5 px-6 py-3 flex justify-between items-center z-40 transition-colors">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 font-bold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              {isEn ? 'Back' : '返回'}
            </button>
            <div className="flex items-center gap-3">
               <img src={student.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-gray-100" />
               <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{student.name}</h1>
            </div>
         </div>
         <div className="flex gap-4">
            {riskDimensions.map(dim => (
                <div key={dim.id} className="flex flex-col items-center gap-0.5">
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     dim.level === 'high' ? 'bg-red-500' : dim.level === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                   )}></div>
                   <span className="text-[9px] font-bold text-gray-400 uppercase">{dim.label}</span>
                </div>
            ))}
         </div>
      </header>

      <div className={cn(
        "bg-white dark:bg-zinc-900 border-b border-[#e5e0dc] transition-all duration-300 overflow-hidden z-30 shadow-sm",
        isPanelExpanded ? 'max-h-[400px]' : 'max-h-12'
      )}>
         <div onClick={() => setIsPanelExpanded(!isPanelExpanded)} className="px-6 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50/50">
            <button 
              onClick={(e) => {e.stopPropagation(); handleDeepDiagnosis();}} 
              disabled={isDiagnosing}
              className="flex items-center gap-2 px-3 py-1 bg-primary-900 dark:bg-zinc-800 text-white rounded text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isDiagnosing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3 text-yellow-300"/>}
              {isEn ? 'AI Diagnosis' : 'AI 深度诊断'}
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              {isPanelExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </div>
         </div>
         <div className="px-8 pb-8 pt-2 grid grid-cols-5 gap-3">
            {riskDimensions.map(dim => (
                <div key={dim.id} className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-zinc-850">
                    <p className="text-xs font-black text-gray-900 dark:text-zinc-100 mb-1">{dim.label}</p>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-2">{dim.statusText}</p>
                </div>
            ))}
         </div>
      </div>

      <nav className="bg-white dark:bg-zinc-900 border-b border-[#e5e0dc] dark:border-white/5 px-6">
         <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
               <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={cn(
                  "py-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
                  activeTab === tab.id 
                    ? 'border-primary-600 text-primary-900 dark:text-primary-300 dark:border-primary-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300'
                )}
               >
                {tab.icon}{tab.label}
               </button>
            ))}
         </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-10 bg-[#f9f8f6] dark:bg-zinc-950 transition-colors">
         {activeTab === 'BasicInfo' && <StudentBasicInfo student={student} onNavigateToTranscript={() => onNavigateToTranscript(student.id)} onAddProof={handleAddVerifiedProof} />}
         {activeTab === 'Materials' && <StudentMaterials files={materialFiles} onUpdateFiles={setMaterialFiles} />}
         {activeTab === 'Planning' && <StudentPlanning student={student} />}
         {activeTab === 'Essays' && <StudentEssays student={student} />}
         {activeTab === 'Recommendations' && <StudentRecommendations />}
         {activeTab === 'OfferTracking' && <StudentOfferTracking />}
         {activeTab === 'Communication' && <StudentCommunication />}
      </main>
    </div>
  );
};

export default StudentDetail;

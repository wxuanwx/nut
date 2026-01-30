
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, FileText, School, Edit, Save, History, 
  Send, Loader2, Plus, CheckCircle, Clock, Trash2, 
  ChevronRight, AlertCircle, RefreshCw, Lightbulb, 
  Zap, Target, LayoutGrid, MoreHorizontal, Quote, X,
  FolderOpen, User, Wand2, Check, ArrowRight, MousePointerClick,
  Maximize2, Minimize2, Star, GitCommit, RotateCcw, Calendar, Mail,
  Bot, FileDiff, Tag, Languages, MessageSquare
} from '../common/Icons';
import { GoogleGenAI, Type } from "@google/genai";
import { StudentSummary } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface StudentEssaysProps {
  student: StudentSummary;
}

type ViewMode = 'Brainstorm' | 'Drafting' | 'History';
type VersionSource = 'Student_Submit' | 'Teacher_Save' | 'AI_Generate' | 'System_Restore';

interface EssayVersion {
  id: string;
  versionNumber: string;
  content: string; 
  updatedAt: string;
  timestamp: number;
  author: 'Student' | 'Teacher' | 'AI';
  source: VersionSource;
  note?: string; 
  tags?: string[];
  wordCount: number;
}

interface IdeaCard {
  id: string;
  title: string;
  hook: string;
  coreValues: string[];
  plotSummary: string;
  isFavorite: boolean;
}

interface EssayFeedback {
  id: string;
  originalText: string;
  comment: string;
  type: 'Grammar' | 'Clarity' | 'Story';
  isResolved: boolean;
}

interface EssayTask {
  id: string;
  title: string;
  school: string; 
  type: 'Personal Statement' | 'Why Major' | 'Activity' | 'Community';
  wordLimit: number;
  deadline: string;
  status: 'Not Started' | 'Brainstorming' | 'Drafting' | 'Reviewing' | 'Finalized';
  contextKeywords: string; 
  ideaCards: IdeaCard[];   
  currentContent: string;
  lastSavedAt: string;
  versions: EssayVersion[];
  feedback: EssayFeedback[];
}

type SuggestionType = 'Correctness' | 'Clarity' | 'Engagement' | 'Delivery';

interface EditorSuggestion {
  id: string;
  originalText: string;
  suggestedText: string;
  type: SuggestionType;
  explanation: string; 
  shortReason: string; 
  contextStart?: number; 
}

interface AiOption {
  label: string;
  text: string;
  reason?: string;
}

const INITIAL_ESSAYS: EssayTask[] = [
  {
    id: 'e1',
    title: 'Common App Main Essay',
    school: 'Common App',
    type: 'Personal Statement',
    wordLimit: 650,
    deadline: '2024-11-01',
    status: 'Drafting',
    contextKeywords: '乐高比赛失败, 熬夜写代码, 喜欢科幻小说',
    ideaCards: [],
    currentContent: "I have always been fascinated by the way small pieces come together. My journey began with Legos. These early builds were more than play; they were my first lessons in structural integrity.",
    lastSavedAt: '刚刚',
    versions: [],
    feedback: [
      { id: 'f1', originalText: 'small pieces', comment: 'Consider using "modular elements" for a more technical tone.', type: 'Clarity', isResolved: false }
    ]
  }
];

const StudentEssays: React.FC<StudentEssaysProps> = ({ student }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const [essays, setEssays] = useState<EssayTask[]>(INITIAL_ESSAYS);
  const [activeEssayId, setActiveEssayId] = useState<string>(INITIAL_ESSAYS[0].id);
  const [activeView, setActiveView] = useState<ViewMode>('Drafting');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EditorSuggestion[]>([]);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const [essayScore, setEssayScore] = useState(85);

  const [rightPanelTab, setRightPanelTab] = useState<'Brief' | 'Inspiration' | 'Tools' | 'Feedback'>('Brief');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [aiOptions, setAiOptions] = useState<AiOption[] | null>(null);
  const [activeToolType, setActiveToolType] = useState<'Polishing' | 'Fix' | null>(null);

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionNote, setNewVersionNote] = useState('');
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set());

  const activeEssay = essays.find(e => e.id === activeEssayId) || essays[0];

  const handleContentUpdate = (val: string) => {
    setEssays(prev => prev.map(e => e.id === activeEssayId ? { ...e, currentContent: val, lastSavedAt: 'Saving...' } : e));
    setTimeout(() => {
        setEssays(prev => prev.map(e => e.id === activeEssayId ? { ...e, lastSavedAt: isEn ? 'Just now' : '刚刚' } : e));
    }, 1000);
  };

  const handleSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = activeEssay.currentContent.substring(start, end);
      if (text.trim().length > 0) {
        setSelection({ start, end, text });
        if (rightPanelTab !== 'Tools') setRightPanelTab('Tools');
        setIsRightPanelOpen(true);
        setAiOptions(null);
        setActiveToolType(null);
      }
    }
  };

  const runAiTool = async (type: 'Polishing' | 'Fix') => {
    if (!selection) return;
    setIsAiLoading(true);
    setActiveToolType(type);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = type === 'Polishing' 
        ? `Polish this essay text in 3 styles (Formal, Emotional, Academic): "${selection.text}"` 
        : `Fix grammar for: "${selection.text}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        setAiOptions(JSON.parse(response.text));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiOption = (text: string) => {
    if (!selection) return;
    const newContent = activeEssay.currentContent.substring(0, selection.start) + text + activeEssay.currentContent.substring(selection.end);
    handleContentUpdate(newContent);
    setAiOptions(null);
    setSelection(null);
  };

  const renderHighlightedText = () => {
    return <div className="whitespace-pre-wrap leading-loose font-serif text-lg text-gray-800">{activeEssay.currentContent}</div>;
  };

  return (
     <div className="flex h-full bg-[#f9f8f6]">
        {/* Left Nav */}
        <div className="w-60 flex-shrink-0 bg-white border-r border-[#e5e0dc] flex flex-col">
           <div className="p-4 border-b border-gray-100 flex justify-between items-center font-bold text-sm">
              {isEn ? 'My Essays' : '我的文书'}
           </div>
           <div className="flex-1 overflow-y-auto p-2">
              {essays.map(essay => (
                 <div key={essay.id} onClick={() => setActiveEssayId(essay.id)} className={`p-3 rounded-lg cursor-pointer transition-all border ${activeEssayId === essay.id ? 'bg-primary-50 border-primary-200' : 'border-transparent hover:bg-gray-50'}`}>
                    <p className="text-xs font-bold truncate">{essay.school}</p>
                    <p className="text-[10px] text-gray-500">{essay.type}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
           <div className="h-16 bg-white border-b border-[#e5e0dc] px-6 flex items-center justify-between">
              <h1 className="text-lg font-bold">{activeEssay.title}</h1>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                  {(['Brainstorm', 'Drafting', 'History'] as ViewMode[]).map(mode => (
                     <button key={mode} onClick={() => setActiveView(mode)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${activeView === mode ? 'bg-white shadow-sm' : 'text-gray-500'}`}>{mode}</button>
                  ))}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto bg-white p-12">
              <div className="max-w-3xl mx-auto relative">
                 {renderHighlightedText()}
                 <textarea 
                    ref={textareaRef}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text resize-none"
                    value={activeEssay.currentContent}
                    onChange={(e) => handleContentUpdate(e.target.value)}
                    onSelect={handleSelect}
                 />
              </div>
           </div>
        </div>

        {/* Right Sidebar */}
        <div className={`bg-white border-l border-[#e5e0dc] flex flex-col transition-all ${isRightPanelOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
           <div className="flex p-2 border-b border-gray-100">
              {['Brief', 'Inspiration', 'Tools', 'Feedback'].map(tab => (
                 <button key={tab} onClick={() => setRightPanelTab(tab as any)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${rightPanelTab === tab ? 'bg-violet-50 text-violet-700' : 'text-gray-500'}`}>{tab}</button>
              ))}
           </div>
           <div className="p-4 space-y-4">
              {rightPanelTab === 'Tools' && (
                 <div className="space-y-4">
                    {!selection ? (
                       <p className="text-xs text-gray-400 text-center py-8">{isEn ? 'Select text to polish' : '选中文字以启用润色'}</p>
                    ) : (
                       <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => runAiTool('Polishing')} className="p-3 bg-gray-50 rounded-xl border hover:border-violet-300">
                             {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : <Sparkles className="w-4 h-4 text-violet-500 mx-auto"/>}
                             <p className="text-xs font-bold mt-1 text-center">Polish</p>
                          </button>
                       </div>
                    )}
                    {aiOptions && (
                       <div className="space-y-2">
                          {aiOptions.map((opt, i) => (
                             <div key={i} onClick={() => applyAiOption(opt.text)} className="p-3 border rounded-xl hover:border-violet-400 cursor-pointer">
                                <span className="text-[10px] font-bold text-violet-600">{opt.label}</span>
                                <p className="text-xs mt-1">{opt.text}</p>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
     </div>
  );
};

export default StudentEssays;


import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, FileText, School, Edit, Save, History, 
  Send, Loader2, Plus, CheckCircle, Clock, Trash2, 
  ChevronRight, AlertCircle, RefreshCw, Lightbulb, 
  Zap, Target, LayoutGrid, MoreHorizontal, Quote, X,
  FolderOpen, User, Wand2, Check, ArrowRight, MousePointerClick,
  Maximize2, Minimize2, Star, GitCommit, RotateCcw, Calendar, Mail,
  Bot, FileDiff, Tag, Languages
} from '../common/Icons';
import { GoogleGenAI, Type } from "@google/genai";
import { StudentSummary } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface StudentEssaysProps {
  student: StudentSummary;
}

// --- Data Types ---
type ViewMode = 'Brainstorm' | 'Drafting' | 'History';

type VersionSource = 'Student_Submit' | 'Teacher_Save' | 'AI_Generate' | 'System_Restore';

interface EssayVersion {
  id: string;
  versionNumber: string; // Changed to string for "V1.0", "V1.1" style
  content: string; 
  updatedAt: string;
  timestamp: number; // For sorting
  author: 'Student' | 'Teacher' | 'AI';
  source: VersionSource;
  note?: string; 
  tags?: string[]; // e.g. ["Draft 1", "Polished"]
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

interface EssayTask {
  id: string;
  title: string;
  school: string; 
  type: 'Personal Statement' | 'Why Major' | 'Activity' | 'Community';
  wordLimit: number;
  deadline: string;
  status: 'Not Started' | 'Brainstorming' | 'Drafting' | 'Reviewing' | 'Finalized';
  
  // Tab 1: Brainstorming Data
  contextKeywords: string; 
  ideaCards: IdeaCard[];   
  
  // Tab 2: Drafting Data
  currentContent: string;
  lastSavedAt: string;
  
  // Tab 3: History
  versions: EssayVersion[];
}

// New Types for the Editor
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

// --- Mock Initial Data ---
const INITIAL_ESSAYS: EssayTask[] = [
  {
    id: 'e1',
    title: 'Common App Main Essay',
    school: 'Common App',
    type: 'Personal Statement',
    wordLimit: 650,
    deadline: '2024-11-01',
    status: 'Drafting',
    contextKeywords: '乐高比赛失败, 熬夜写代码, 喜欢科幻小说, 奶奶的缝纫机',
    ideaCards: [
      {
        id: 'c1',
        title: 'The Lego Metaphor',
        hook: "It wasn't the tower that mattered, but the pieces I couldn't fit.",
        coreValues: ['Resilience', 'Innovation'],
        plotSummary: '通过乐高搭建失败的经历，引申到编程中对完美代码的追求，最后感悟到“不完美”才是创新的开始。',
        isFavorite: false
      },
    ],
    currentContent: "I have always been fascinated by the way small peices come together to create something larger than life. My journey began with Legos. These early builds were more than play; they were my first lessons in structural integrity. I think I am a very hard working student who likes to build things.",
    lastSavedAt: '刚刚',
    versions: [
      { 
        id: 'v3', 
        versionNumber: 'V2.0', 
        content: "I have always been fascinated by the way small peices come together to create something larger than life. My journey began with Legos. These early builds were more than play; they were my first lessons in structural integrity. I think I am a very hard working student who likes to build things.", 
        updatedAt: '2024-10-24 14:20', 
        timestamp: 1729750800000,
        author: 'Teacher', 
        source: 'Teacher_Save',
        note: 'Fixed intro structure, waiting for student expansion.',
        tags: ['Review In Progress'],
        wordCount: 42
      },
      { 
        id: 'v2', 
        versionNumber: 'V1.5', 
        content: "I like Legos because they teach me structure. When I build, I feel happy. It connects to my CS major.", 
        updatedAt: '2024-10-22 09:15', 
        timestamp: 1729581300000,
        author: 'AI', 
        source: 'AI_Generate',
        note: 'AI Polished: Clarity improvement',
        tags: ['AI Polish'],
        wordCount: 35
      },
      { 
        id: 'v1', 
        versionNumber: 'V1.0', 
        content: "I like Legos. They are fun. I build tall towers.", 
        updatedAt: '2024-10-20 10:00', 
        timestamp: 1729408800000,
        author: 'Student', 
        source: 'Student_Submit',
        note: 'First Draft Submission',
        tags: ['Draft 1'],
        wordCount: 20
      }
    ]
  },
  {
    id: 'e2',
    title: 'Why Carnegie Mellon?',
    school: 'Carnegie Mellon University',
    type: 'Why Major',
    wordLimit: 300,
    deadline: '2025-01-01',
    status: 'Brainstorming',
    contextKeywords: '',
    ideaCards: [],
    currentContent: "",
    lastSavedAt: '-',
    versions: []
  }
];

// --- Toast Notification Component ---
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
    <CheckCircle className="w-4 h-4 text-green-400" />
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-3 h-3" /></button>
  </div>
);

// --- Helper Functions ---
const cleanJson = (text: string) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

const getSuggestionColor = (type: SuggestionType) => {
  switch (type) {
    case 'Correctness': return { border: 'border-b-2 border-red-400', text: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-100' };
    case 'Clarity': return { border: 'border-b-2 border-blue-400', text: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' };
    case 'Engagement': return { border: 'border-b-2 border-purple-400', text: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100' };
    case 'Delivery': return { border: 'border-b-2 border-orange-400', text: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' };
  }
};

const StudentEssays: React.FC<StudentEssaysProps> = ({ student }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const [essays, setEssays] = useState<EssayTask[]>(INITIAL_ESSAYS);
  const [activeEssayId, setActiveEssayId] = useState<string>(INITIAL_ESSAYS[0].id);
  const [activeView, setActiveView] = useState<ViewMode>('Drafting');
  
  // Interaction State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Editor & Suggestion State
  const [suggestions, setSuggestions] = useState<EditorSuggestion[]>([]);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  
  // Editor Refs & Selection
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  
  // Score State
  const [essayScore, setEssayScore] = useState(85);

  // History State
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionNote, setNewVersionNote] = useState('');

  // Brainstorm Multi-select State
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set());

  const activeEssay = essays.find(e => e.id === activeEssayId) || essays[0];

  // Derived System Context
  const systemContextItems = [
    { label: isEn ? 'Target Profile' : '目标画像', value: `${student.targetSummary} / ${student.direction}` },
    { label: isEn ? 'Activity' : '活动经历', value: 'Robotics Club Founder, AMC 12 Distinction' },
    { label: isEn ? 'Essay Material' : '文书素材', value: "'Discussion on failure in LEGO building' (from Interview Notes)" }
  ];

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    setSuggestions([]);
    setHasScanned(false);
    setEssayScore(85);
    // Select the latest version by default if in history mode
    setSelectedVersionId(activeEssay.versions.length > 0 ? activeEssay.versions[0].id : null);
    setSelectedIdeaIds(new Set());
  }, [activeEssayId]);

  const showToast = (msg: string) => setToastMessage(msg);

  // --- Core Handlers ---

  const handleContextUpdate = (val: string) => {
    setEssays(prev => prev.map(e => e.id === activeEssayId ? { ...e, contextKeywords: val } : e));
  };

  const handleContentUpdate = (val: string) => {
    setEssays(prev => prev.map(e => e.id === activeEssayId ? { ...e, currentContent: val, lastSavedAt: isEn ? 'Saving...' : 'Saving...' } : e));
    // Simulate auto-save delay
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
      } else {
        setSelection(null);
      }
    }
  };

  const handleAddContextToKeywords = (text: string) => {
    const current = activeEssay.contextKeywords || '';
    const separator = current.trim().length > 0 ? '\n' : '';
    handleContextUpdate(current + separator + text);
  };

  const handleToggleFavorite = (cardId: string) => {
    setEssays(prev => prev.map(e => {
        if (e.id !== activeEssayId) return e;
        return {
            ...e,
            ideaCards: e.ideaCards.map(c => c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c)
        };
    }));
  };

  const handleToggleIdeaSelection = (cardId: string) => {
    const newSet = new Set(selectedIdeaIds);
    if (newSet.has(cardId)) {
      newSet.delete(cardId);
    } else {
      newSet.add(cardId);
    }
    setSelectedIdeaIds(newSet);
  };

  const handleSendIdeasToStudent = () => {
    if (selectedIdeaIds.size === 0) return;
    showToast(isEn ? `Sent ${selectedIdeaIds.size} ideas to student` : `已将 ${selectedIdeaIds.size} 个灵感方案发送给学生`);
    setSelectedIdeaIds(new Set());
  };

  const handleDeleteIdea = (cardId: string) => {
      setEssays(prev => prev.map(e => {
          if (e.id !== activeEssayId) return e;
          return {
              ...e,
              ideaCards: e.ideaCards.filter(c => c.id !== cardId)
          };
      }));
  };

  // --- VERSIONING LOGIC ---

  const createSnapshot = (source: VersionSource, note: string, author: 'Teacher' | 'AI' | 'Student' = 'Teacher') => {
    const newVersionNumber = `V${(parseFloat(activeEssay.versions[0]?.versionNumber.replace('V','') || '0') + 0.1).toFixed(1)}`;
    const wordCount = activeEssay.currentContent.split(/\s+/).filter(Boolean).length;
    
    const newVersion: EssayVersion = {
      id: `v-${Date.now()}`,
      versionNumber: newVersionNumber,
      content: activeEssay.currentContent,
      updatedAt: new Date().toLocaleString(isEn ? 'en-US' : 'zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'}),
      timestamp: Date.now(),
      author: author,
      source: source,
      note: note,
      wordCount: wordCount,
      tags: source === 'AI_Generate' ? ['AI Assisted'] : source === 'Teacher_Save' ? ['Teacher Snapshot'] : []
    };

    setEssays(prev => prev.map(e => 
      e.id === activeEssayId ? { ...e, versions: [newVersion, ...e.versions] } : e
    ));
    
    return newVersion;
  };

  const handleManualSaveVersion = () => {
    if (!newVersionNote.trim()) {
        showToast(isEn ? "Please enter version note" : "请输入版本备注");
        return;
    }
    createSnapshot('Teacher_Save', newVersionNote, 'Teacher');
    setIsCreatingVersion(false);
    setNewVersionNote('');
    showToast(isEn ? "Version Saved" : "版本已保存");
    // Optionally switch to history view or just stay
  };

  // --- Handlers: AI ---

  const handleGenerateIdeas = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contextStr = systemContextItems.map(i => `${i.label}: ${i.value}`).join('; ');
      const prompt = `
        Role: Creative Writing Coach.
        Task: Brainstorm 3 distinct essay angles based on student profile.
        Context: ${contextStr}
        Manual Keywords: "${activeEssay.contextKeywords}"
        Essay Type: ${activeEssay.type}
        
        Requirements: Hook, Core Values, Plot Summary, Title.
        Output JSON Array.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        hook: { type: Type.STRING },
                        coreValues: { type: Type.ARRAY, items: { type: Type.STRING } },
                        plotSummary: { type: Type.STRING }
                    }
                }
            }
        }
      });

      if (response.text) {
        // cast JSON.parse result to any and check for array to avoid unknown type issues when calling map()
        const parsedResult: any = JSON.parse(cleanJson(response.text));
        const rawIdeas: any[] = Array.isArray(parsedResult) ? parsedResult : [];
        const formattedIdeas: IdeaCard[] = rawIdeas.map((idea: any) => ({
          ...idea,
          id: `idea-${Date.now()}-${Math.random()}`,
          isFavorite: false
        }));
        setEssays(prev => prev.map(e => e.id === activeEssayId ? { ...e, ideaCards: [...e.ideaCards, ...formattedIdeas] } : e));
      }
    } catch (e) {
      console.error(e);
      showToast(isEn ? "Failed to generate, please try again." : "生成失败，请重试");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleScanEssay = async () => {
    if (!activeEssay.currentContent.trim()) return;
    setIsAiLoading(true);
    setSuggestions([]);
    setActiveSuggestionId(null);
    setHasScanned(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Role: Ivy League Essay Editor.
        Task: Review the draft. Identify improvements (Correctness, Clarity, Engagement, Delivery).
        Content: "${activeEssay.currentContent}"
        Constraint: Find 3-6 specific actionable issues.
        Output JSON Array of {originalText, suggestedText, type, shortReason, explanation}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        // Explicitly cast JSON.parse result to any and check for array to ensure .map exists and avoid unknown type errors
        const parsedResult: any = JSON.parse(cleanJson(response.text));
        const rawSuggestions: any[] = Array.isArray(parsedResult) ? parsedResult : [];
        const formatted: EditorSuggestion[] = rawSuggestions.map((item: any, idx: number) => ({
          ...item,
          id: `sug-${Date.now()}-${idx}`
        }));
        setSuggestions(formatted);
        setHasScanned(true);
      }
    } catch (e) {
      console.error(e);
      showToast(isEn ? "Scan failed" : "诊断失败");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: EditorSuggestion) => {
    const newContent = activeEssay.currentContent.replace(suggestion.originalText, suggestion.suggestedText);
    handleContentUpdate(newContent);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setActiveSuggestionId(null);
    setEssayScore(prev => Math.min(100, prev + 5));
    showToast(isEn ? "Applied" : "已应用修改");
  };

  // --- Handlers: History ---
  const handleRestoreVersion = () => {
    const versionToRestore = activeEssay.versions.find(v => v.id === selectedVersionId);
    if (!versionToRestore) return;

    if (window.confirm(isEn 
        ? `Restore content to version ${versionToRestore.versionNumber}? Current content will be backed up.` 
        : `确认将内容回滚至版本 ${versionToRestore.versionNumber}？当前内容将自动保存为备份。`)) {
      // 1. Create Backup of current
      createSnapshot('System_Restore', `Auto-backup before restoring ${versionToRestore.versionNumber}`, 'Teacher');

      // 2. Restore
      setEssays(prev => prev.map(e => {
        if (e.id !== activeEssayId) return e;
        return { ...e, currentContent: versionToRestore.content };
      }));
      
      showToast(isEn ? "Restored" : "已恢复版本");
      setActiveView('Drafting');
    }
  };

  // --- Rendering Helpers ---
  const getSourceIcon = (source: VersionSource) => {
    switch (source) {
      case 'Student_Submit': return <User className="w-3 h-3 text-blue-600" />;
      case 'Teacher_Save': return <Edit className="w-3 h-3 text-primary-600" />;
      case 'AI_Generate': return <Sparkles className="w-3 h-3 text-purple-600" />;
      case 'System_Restore': return <RotateCcw className="w-3 h-3 text-gray-600" />;
    }
  };

  const getSourceLabel = (source: VersionSource) => {
    switch (source) {
      case 'Student_Submit': return isEn ? 'Student Submitted' : '学生提交';
      case 'Teacher_Save': return isEn ? 'Teacher Snapshot' : '老师保存';
      case 'AI_Generate': return isEn ? 'AI Iteration' : 'AI 润色';
      case 'System_Restore': return isEn ? 'System Restore' : '系统恢复';
    }
  };

  // Group versions by date
  const groupedVersions = activeEssay.versions.reduce((acc, version) => {
    const date = version.updatedAt.split(' ')[0]; // Simple grouping
    if (!acc[date]) acc[date] = [];
    acc[date].push(version);
    return acc;
  }, {} as Record<string, EssayVersion[]>);

  const renderHighlightedText = () => {
    if (suggestions.length === 0) return <div className="whitespace-pre-wrap leading-loose">{activeEssay.currentContent}</div>;
    // ... (Text highlight logic remains same as before)
    let content = activeEssay.currentContent;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const sortedSuggestions = [...suggestions].map(s => ({...s, index: content.indexOf(s.originalText)})).filter(s => s.index !== -1).sort((a, b) => a.index - b.index);
    if (sortedSuggestions.length === 0) return <div className="whitespace-pre-wrap leading-loose">{content}</div>;
    sortedSuggestions.forEach((sug, i) => {
        if (sug.index < lastIndex) return; 
        parts.push(<span key={`text-${i}`}>{content.slice(lastIndex, sug.index)}</span>);
        const styles = getSuggestionColor(sug.type);
        parts.push(
            <span key={`sug-${sug.id}`} onClick={() => setActiveSuggestionId(sug.id)} className={`cursor-pointer ${styles.border} hover:bg-opacity-20 hover:bg-gray-200 transition-colors pb-0.5 ${activeSuggestionId === sug.id ? 'bg-yellow-100/50' : ''}`}>{sug.originalText}</span>
        );
        lastIndex = sug.index + sug.originalText.length;
    });
    parts.push(<span key="text-end">{content.slice(lastIndex)}</span>);
    return <div className="whitespace-pre-wrap leading-loose font-serif text-lg text-gray-800">{parts}</div>;
  };

  return (
     <div className="flex h-full gap-0 animate-in fade-in slide-in-from-bottom-2 relative bg-[#f9f8f6]">
        
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

        {/* 1. Left Nav */}
        <div className="w-60 flex-shrink-0 bg-white border-r border-[#e5e0dc] flex flex-col z-10">
           <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">{isEn ? 'My Essays' : '我的文书'}</h3>
              <button className="text-gray-400 hover:text-primary-600"><Plus className="w-4 h-4"/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {essays.map(essay => (
                 <div 
                    key={essay.id}
                    onClick={() => setActiveEssayId(essay.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border group
                       ${activeEssayId === essay.id ? 'bg-primary-50 border-primary-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}
                    `}
                 >
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`text-xs font-bold truncate ${activeEssayId === essay.id ? 'text-gray-900' : 'text-gray-600'}`}>{essay.school}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-gray-500">{essay.type}</span>
                       {activeEssayId === essay.id && <ChevronRight className="w-3 h-3 text-primary-400" />}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* 2. Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
           
           {/* Global Header */}
           <div className="h-16 bg-white border-b border-[#e5e0dc] px-6 flex items-center justify-between flex-shrink-0 z-30">
              <div className="flex flex-col">
                  <h1 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">{activeEssay.title}</h1>
                  <span className="text-xs text-gray-500 mt-0.5">{activeEssay.school} • {activeEssay.type}</span>
              </div>

              <div className="flex bg-gray-100/80 p-1 rounded-xl">
                  {(['Brainstorm', 'Drafting', 'History'] as ViewMode[]).map(mode => (
                     <button
                        key={mode}
                        onClick={() => setActiveView(mode)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2
                           ${activeView === mode ? 'bg-white text-primary-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                        `}
                     >
                        {mode === 'Brainstorm' && <Lightbulb className="w-3 h-3" />}
                        {mode === 'Drafting' && <Edit className="w-3 h-3" />}
                        {mode === 'History' && <History className="w-3 h-3" />}
                        {mode === 'Brainstorm' 
                            ? (isEn ? 'Brainstorm' : '灵感画布') 
                            : mode === 'Drafting' 
                                ? (isEn ? 'Editor' : '写作润色') 
                                : (isEn ? 'History' : '版本历史')}
                     </button>
                  ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 w-48 justify-end">
                 {activeView === 'Drafting' && (
                     <>
                         <span className="font-mono">{activeEssay.currentContent.split(/\s+/).filter(Boolean).length} words</span>
                         <div className="h-3 w-px bg-gray-300"></div>
                         <span className="text-green-600 flex items-center gap-1 font-medium"><Check className="w-3 h-3"/> {activeEssay.lastSavedAt}</span>
                     </>
                 )}
              </div>
           </div>

           {/* --- VIEW: BRAINSTORM --- */}
           {activeView === 'Brainstorm' && (
              <div className="flex-1 flex flex-col h-full bg-[#f9f8f6] p-8 overflow-y-auto">
                 <div className="max-w-5xl mx-auto w-full">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" /> {isEn ? 'Brainstorming' : '灵感捕捉与构思'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{isEn ? 'Use AI to generate essay angles based on student profile.' : '基于学生画像与申请材料，利用 AI 发散文书切入角度。'}</p>
                    </div>

                    {/* Context Suggestions */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-purple-500" /> 
                                {isEn ? 'Smart Context' : '智能素材推荐 (Smart Context)'}
                            </h3>
                            <p className="text-xs text-gray-500">{isEn ? 'Click tags to add to context:' : '点击以下标签，将其加入构思上下文：'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {systemContextItems.map((item, idx) => (
                                 <button 
                                    key={idx}
                                    onClick={() => handleAddContextToKeywords(`${item.label}: ${item.value}`)}
                                    className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-medium hover:bg-purple-100 hover:border-purple-200 transition-all flex items-center gap-1"
                                 >
                                    <Plus className="w-3 h-3" />
                                    {item.value.length > 20 ? item.value.substring(0, 20) + '...' : item.value}
                                 </button>
                            ))}
                            {/* Add some static suggestions suitable for essays */}
                            {['Growth Mindset', 'Intellectual Vitality', 'Unique Hobby', 'Family Influence'].map((tag, i) => (
                                <button
                                    key={`static-${i}`}
                                    onClick={() => handleAddContextToKeywords(tag)}
                                    className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition-all flex items-center gap-1"
                                 >
                                    <Plus className="w-3 h-3" /> {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-8 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all">
                        <textarea 
                            className="w-full h-32 p-4 text-sm text-gray-800 outline-none resize-none rounded-t-xl"
                            placeholder={isEn ? "Enter keywords, fragments, or requirements here..." : "在此输入您的灵感碎片、核心关键词或具体要求... (AI 将基于此进行发散)"}
                            value={activeEssay.contextKeywords}
                            onChange={(e) => handleContextUpdate(e.target.value)}
                        />
                        <div className="bg-gray-50 px-4 py-3 rounded-b-xl flex justify-between items-center border-t border-gray-100">
                            <span className="text-xs text-gray-400">
                                {activeEssay.contextKeywords.length} chars
                            </span>
                            <button 
                                onClick={handleGenerateIdeas}
                                disabled={isAiLoading || !activeEssay.contextKeywords.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-yellow-300"/>}
                                {isAiLoading ? (isEn ? 'Generating...' : 'AI 构思中...') : (isEn ? 'Generate Ideas' : '开始生成灵感 (Brainstorm)')}
                            </button>
                        </div>
                    </div>

                    {/* Results Grid (Existing Code) */}
                    {activeEssay.ideaCards.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-end">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary-600" /> {isEn ? 'Results' : '生成结果'}
                                </h3>
                                {selectedIdeaIds.size > 0 && (
                                    <button 
                                        onClick={handleSendIdeasToStudent}
                                        className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-primary-700 transition-all flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2"
                                    >
                                        <Send className="w-3 h-3" />
                                        {isEn ? `Send (${selectedIdeaIds.size}) to Student` : `发送 (${selectedIdeaIds.size}) 给学生`}
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {activeEssay.ideaCards.map((card) => {
                                  const isSelected = selectedIdeaIds.has(card.id);
                                  return (
                                    <div 
                                      key={card.id} 
                                      onClick={() => handleToggleIdeaSelection(card.id)}
                                      className={`rounded-xl p-5 border shadow-sm transition-all relative group cursor-pointer
                                         ${isSelected 
                                            ? 'bg-primary-50/40 border-primary-500 ring-1 ring-primary-500' 
                                            : card.isFavorite 
                                                ? 'bg-yellow-50 border-yellow-200 hover:shadow-md' 
                                                : 'bg-white border-gray-200 hover:shadow-md'
                                         }
                                      `}
                                    >
                                       {/* Selection Checkbox */}
                                       <div className={`absolute top-4 left-4 w-5 h-5 rounded border flex items-center justify-center transition-colors z-10
                                          ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-primary-300'}
                                       `}>
                                          <Check className="w-3.5 h-3.5" />
                                       </div>

                                       {/* Action Buttons */}
                                       <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg z-20">
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(card.id); }}
                                              className={`p-1.5 rounded-md transition-colors ${card.isFavorite ? 'text-yellow-500 hover:bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'}`}
                                              title={isEn ? "Favorite" : "收藏"}
                                          >
                                              <Star className={`w-4 h-4 ${card.isFavorite ? 'fill-yellow-500' : ''}`} />
                                          </button>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); handleDeleteIdea(card.id); }}
                                              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                              title={isEn ? "Delete" : "删除"}
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>

                                       <div className="pl-8">
                                          <h3 className="font-bold text-gray-800 mb-2 pr-2">{card.title}</h3>
                                          <p className="text-xs text-gray-600 font-serif leading-relaxed line-clamp-2 italic mb-2">"{card.hook}"</p>
                                          <div className="flex flex-wrap gap-1 mb-3">
                                              {card.coreValues.map(v => <span key={v} className="text-[10px] bg-white/60 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{v}</span>)}
                                          </div>
                                          <p className="text-xs text-gray-600 leading-snug">{card.plotSummary}</p>
                                       </div>
                                    </div>
                                  );
                               })}
                            </div>
                        </div>
                    )}
                 </div>
              </div>
           )}

           {/* --- VIEW: DRAFTING --- */}
           {activeView === 'Drafting' && (
              <div className="flex-1 flex h-full">
                 <div className="flex-1 flex flex-col h-full bg-[#fcfcfc] relative">
                    <div className="flex-1 overflow-y-auto relative" onClick={() => setActiveSuggestionId(null)}>
                       <div className="max-w-3xl mx-auto py-12 px-8 min-h-full">
                          <div className="relative z-0 min-h-[60vh] outline-none">
                             {isAiLoading ? (
                                <div className="animate-pulse opacity-50 whitespace-pre-wrap font-serif text-lg leading-loose">{activeEssay.currentContent}</div>
                             ) : (
                                <div className="relative">
                                   {renderHighlightedText()}
                                   <textarea 
                                      ref={textareaRef}
                                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text resize-none"
                                      value={activeEssay.currentContent}
                                      onChange={(e) => handleContentUpdate(e.target.value)}
                                      onSelect={handleSelect}
                                      spellCheck={false}
                                   />
                                </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Bottom Action Bar: Scan & Manual Save */}
                    <div className="absolute bottom-6 right-8 z-20 flex gap-3">
                       {/* Manual Save Button */}
                       <div className="relative">
                          {isCreatingVersion ? (
                             <div className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3 animate-in slide-in-from-bottom-2">
                                <p className="text-xs font-bold text-gray-600 mb-2">{isEn ? 'Create Snapshot' : '创建版本快照 (Snapshot)'}</p>
                                <input 
                                   autoFocus
                                   className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-primary-500 mb-2"
                                   placeholder={isEn ? "Enter note (e.g. Fixed intro)" : "输入备注 (e.g. 完成了开头修改)"}
                                   value={newVersionNote}
                                   onChange={(e) => setNewVersionNote(e.target.value)}
                                />
                                <div className="flex gap-2">
                                   <button onClick={() => setIsCreatingVersion(false)} className="flex-1 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded">{isEn ? 'Cancel' : '取消'}</button>
                                   <button onClick={handleManualSaveVersion} className="flex-1 py-1.5 text-xs bg-primary-600 text-white rounded font-bold hover:bg-primary-700">{isEn ? 'Save' : '保存'}</button>
                                </div>
                             </div>
                          ) : (
                             <button 
                                onClick={() => setIsCreatingVersion(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full shadow-lg hover:border-primary-400 hover:text-primary-600 transition-all font-bold text-sm"
                             >
                                <GitCommit className="w-4 h-4" /> {isEn ? 'Save Version' : 'Save Version'}
                             </button>
                          )}
                       </div>

                       <button 
                          onClick={handleScanEssay}
                          disabled={isAiLoading || !activeEssay.currentContent}
                          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full shadow-xl hover:bg-black hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                       >
                          {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5 text-yellow-300"/>}
                          {isAiLoading ? (isEn ? 'Analyzing...' : 'Analyzing...') : (isEn ? 'Start AI Scan' : 'Start AI Scan')}
                       </button>
                    </div>
                 </div>

                 {/* Right Sidebar (Suggestions) */}
                 <div className="w-[340px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-20">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Score</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-3xl font-bold text-gray-900">{hasScanned ? essayScore : '--'}</span>
                             <span className="text-sm text-gray-400">/ 100</span>
                          </div>
                       </div>
                       <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${hasScanned ? 'border-primary-100' : 'border-gray-100'}`}>
                          <span className={`font-bold ${hasScanned ? 'text-primary-600' : 'text-gray-300'}`}>{hasScanned ? 'B+' : '-'}</span>
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {/* Suggestion cards logic (same as previous) */}
                        {!hasScanned && (
                           <div className="text-center py-20 px-6">
                              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3"/>
                              <p className="text-xs text-gray-500">{isEn ? 'Click button below to start AI scan' : '点击下方按钮开始 AI 诊断'}</p>
                           </div>
                        )}
                        {suggestions.map((sug) => (
                           <div key={sug.id} onClick={() => setActiveSuggestionId(sug.id)} className={`bg-white rounded-xl p-4 border cursor-pointer ${activeSuggestionId === sug.id ? 'border-primary-500 shadow-md ring-1 ring-primary-500' : 'border-gray-200'}`}>
                              <div className="flex justify-between mb-2">
                                 <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getSuggestionColor(sug.type).bg} ${getSuggestionColor(sug.type).text}`}>{sug.type}</span>
                              </div>
                              <p className="text-xs text-gray-500 line-through mb-1">{sug.originalText}</p>
                              <p className="text-sm font-bold text-gray-800">{sug.suggestedText}</p>
                              <button onClick={(e) => {e.stopPropagation(); handleApplySuggestion(sug)}} className="mt-3 w-full py-1.5 bg-green-50 text-green-700 rounded text-xs font-bold hover:bg-green-100">Apply</button>
                           </div>
                        ))}
                    </div>
                 </div>
              </div>
           )}

           {/* --- VIEW: HISTORY (Enhanced) --- */}
           {activeView === 'History' && (
              <div className="flex-1 flex h-full bg-[#f9f8f6]">
                 {/* Left: Enhanced Timeline List */}
                 <div className="w-80 flex-shrink-0 bg-white border-r border-[#e5e0dc] overflow-y-auto">
                    <div className="p-5 border-b border-gray-100">
                       <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <History className="w-5 h-5 text-primary-600" /> {isEn ? 'Version Timeline' : '版本演进 (Version Timeline)'}
                       </h3>
                       <p className="text-xs text-gray-500 mt-1">{isEn ? 'Track full history of changes' : '追踪学生提交与老师修改的全过程'}</p>
                    </div>
                    <div className="p-2 space-y-6">
                       {Object.entries(groupedVersions).map(([date, vers]) => (
                          <div key={date}>
                             <div className="px-4 py-2 text-xs font-bold text-gray-400 sticky top-0 bg-white z-10">{date}</div>
                             <div className="space-y-1">
                                {vers.map((version) => (
                                   <div 
                                      key={version.id}
                                      onClick={() => setSelectedVersionId(version.id)}
                                      className={`mx-2 px-3 py-3 rounded-lg cursor-pointer transition-all border relative group
                                         ${selectedVersionId === version.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}
                                      `}
                                   >
                                      {/* Vertical Connector Line (Visual only) */}
                                      <div className="flex justify-between items-start">
                                         <div className="flex items-start gap-3">
                                            <div className="mt-0.5 relative">
                                               <div className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm z-10 relative
                                                  ${version.author === 'Student' ? 'bg-blue-50 border-blue-100' : 
                                                    version.author === 'AI' ? 'bg-purple-50 border-purple-100' : 
                                                    'bg-orange-50 border-orange-100'}
                                               `}>
                                                  {getSourceIcon(version.source)}
                                               </div>
                                            </div>
                                            <div>
                                               <div className="flex items-center gap-2">
                                                  <span className={`text-xs font-bold ${selectedVersionId === version.id ? 'text-primary-900' : 'text-gray-800'}`}>
                                                     {version.versionNumber}
                                                  </span>
                                                  <span className="text-[10px] text-gray-400">{version.updatedAt.split(' ')[1]}</span>
                                               </div>
                                               <p className="text-[10px] text-gray-500 font-medium mt-0.5">{getSourceLabel(version.source)}</p>
                                               {version.note && (
                                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 bg-gray-50/50 p-1 rounded">
                                                     "{version.note}"
                                                  </p>
                                               )}
                                               {version.tags && version.tags.length > 0 && (
                                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                                     {version.tags.map(t => (
                                                        <span key={t} className="text-[9px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">{t}</span>
                                                     ))}
                                                  </div>
                                               )}
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Right: Preview with Restore */}
                 <div className="flex-1 flex flex-col min-w-0">
                    {selectedVersionId ? (
                       <>
                          <div className="bg-white border-b border-[#e5e0dc] px-6 py-3 flex justify-between items-center shadow-sm z-10">
                             <div className="flex items-center gap-3">
                                <div className={`px-2 py-1 rounded text-xs font-bold border
                                   ${activeEssay.versions.find(v => v.id === selectedVersionId)?.author === 'Student' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}
                                `}>
                                   {activeEssay.versions.find(v => v.id === selectedVersionId)?.versionNumber} Preview
                                </div>
                                <span className="text-xs text-gray-400">
                                   Author: {activeEssay.versions.find(v => v.id === selectedVersionId)?.author}
                                </span>
                             </div>
                             
                             <div className="flex gap-3">
                                <div className="h-4 w-px bg-gray-200"></div>
                                <button 
                                   onClick={handleRestoreVersion}
                                   className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors shadow-sm"
                                >
                                   <RotateCcw className="w-4 h-4" /> {isEn ? 'Restore Version' : '恢复此版本 (Restore)'}
                                </button>
                             </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-8 bg-gray-100/50">
                             <div className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-sm border border-gray-200 min-h-[600px] relative">
                                <div className="whitespace-pre-wrap font-serif text-lg text-gray-800 leading-loose">
                                   {activeEssay.versions.find(v => v.id === selectedVersionId)?.content}
                                </div>
                                <div className="absolute top-4 right-4 text-xs text-gray-300 font-mono select-none">READ ONLY</div>
                             </div>
                          </div>
                       </>
                    ) : (
                       <div className="flex-1 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                             <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                             <p>{isEn ? 'Select a version to preview' : '请从左侧选择一个版本进行预览'}</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           )}

        </div>
     </div>
  );
};

export default StudentEssays;

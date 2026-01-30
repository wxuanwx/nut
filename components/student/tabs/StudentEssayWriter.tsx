
import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit, Save, Clock, CheckCircle, Sparkles, 
  Maximize2, Minimize2, ChevronLeft, ChevronRight,
  MessageSquare, Wand2, RefreshCw, Scissors, Type,
  AlertCircle, ArrowRight, Check, X, History,
  Languages, Lightbulb, BookOpen, ChevronDown, ChevronUp,
  FileText, FileDown, Download, User, Copy, Quote
} from '../../common/Icons';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../../../contexts/LanguageContext';

// --- Types ---
interface EssayTask {
  id: string;
  school: string; 
  title: string; 
  type: string;
  prompt: string; 
  wordLimit: number;
  deadline: string;
  status: 'Not Started' | 'Drafting' | 'Reviewing' | 'Finalized';
  content: string;
  feedback: EssayFeedback[];
}

interface EssayFeedback {
  id: string;
  originalText: string;
  comment: string;
  type: 'Grammar' | 'Clarity' | 'Story';
  isResolved: boolean;
}

interface AiOption {
  label: string; // e.g., "Academic", "Vivid", "Concise"
  text: string;
  reason?: string;
}

interface TeacherBrief {
  id: string;
  author: string;
  avatar: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
}

// Mock Activities
const MOCK_ACTIVITIES = [
  { id: 1, title: 'School Robotics Club Founder', description: 'Led a team of 10 to regional finals. Overcame coding failures.' },
  { id: 2, title: 'AMC 12 Distinction', description: 'Self-studied advanced calculus. Demonstrated perseverance.' },
  { id: 3, title: 'Community Elderly Care Volunteer', description: 'Organized weekend visits. Learned empathy and communication.' }
];

// Mock Teacher Briefs
const MOCK_BRIEFS: TeacherBrief[] = [
  {
    id: 'tb1',
    author: 'Ms. Sarah',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Sarah&backgroundColor=ffdfbf',
    date: '2 hours ago',
    title: 'Essay Strategy: The Lego Metaphor',
    content: "Alex, let's stick to the 'Lego' story we brainstormed. \n\nKey Points to Cover:\n1. The 'Collapse': Describe the failure vividly.\n2. The 'Debug': How you analyzed the structure (connect to CS logic).\n3. The 'Rebuild': It's not just about toys, it's about systems engineering.",
    tags: ['Core Narrative', 'Structure']
  }
];

// --- Mock Data ---
const MOCK_ESSAYS: EssayTask[] = [
  {
    id: 'e1',
    school: 'Common App',
    title: 'Personal Statement',
    type: 'Personal Statement',
    prompt: "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?",
    wordLimit: 650,
    deadline: 'Nov 1',
    status: 'Drafting',
    content: `I have always been fascinated by the way small pieces come together to create something larger than life. My journey began with Legos. These early builds were more than play; they were my first lessons in structural integrity.

When I was 10, I tried to build a replica of the Empire State Building. It collapsed three times. Each time, I learned something new about weight distribution. This experience taught me that failure isn't the end, but a data point for the next iteration.`,
    feedback: [
      { id: 'f1', originalText: 'larger than life', comment: 'A bit cliché. Try "complex systems" or something more specific?', type: 'Clarity', isResolved: false }
    ]
  },
  {
    id: 'e2',
    school: 'Carnegie Mellon Univ.',
    title: 'Why Major (SCS)',
    type: 'Why Major',
    prompt: "Most students at CMU choose their intended major during the application process. Please explain your choice of major and why you believe Carnegie Mellon is the best place for you to pursue it.",
    wordLimit: 300,
    deadline: 'Jan 1',
    status: 'Not Started',
    content: "",
    feedback: []
  },
  {
    id: 'e3',
    school: 'New York Univ.',
    title: 'Global Network Essay',
    type: 'Supplemental',
    prompt: "We would like to understand your interest in NYU's global network. What motivates you to apply to NYU's campuses?",
    wordLimit: 400,
    deadline: 'Jan 5',
    status: 'Not Started',
    content: "",
    feedback: []
  }
];

const StudentEssayWriter: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';
  
  // --- State ---
  const [essays, setEssays] = useState<EssayTask[]>(MOCK_ESSAYS);
  const [activeEssayId, setActiveEssayId] = useState<string>(MOCK_ESSAYS[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('Just now');
  
  // Layout State
  const [isZenMode, setIsZenMode] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'Brief' | 'Inspiration' | 'Tools' | 'Feedback'>('Brief');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);

  // Editor State
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  
  // AI Tool States
  const [aiOptions, setAiOptions] = useState<AiOption[] | null>(null); // New Structured State
  const [aiSimpleResult, setAiSimpleResult] = useState<string | null>(null); // Fallback or Simple state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeToolType, setActiveToolType] = useState<'Polishing' | 'Fix' | null>(null);
  
  // Translation Tool State
  const [chineseInput, setChineseInput] = useState('');
  const [translationResult, setTranslationResult] = useState<string | null>(null);

  const activeEssay = essays.find(e => e.id === activeEssayId) || essays[0];
  const wordCount = activeEssay.content.split(/\s+/).filter(Boolean).length;

  // --- Handlers ---

  const handleContentChange = (newContent: string) => {
    setEssays(prev => prev.map(e => e.id === activeEssayId ? { ...e, content: newContent } : e));
    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }, 1000);
    return () => clearTimeout(timeoutId);
  };

  const handleSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = activeEssay.content.substring(start, end);
      if (text.trim().length > 0) {
        setSelection({ start, end, text });
        // Only switch if not already in a useful tab
        if (rightPanelTab !== 'Tools') setRightPanelTab('Tools');
        if (!isRightPanelOpen) setIsRightPanelOpen(true);
        
        // Reset previous suggestions when new text is selected
        setAiOptions(null);
        setAiSimpleResult(null);
        setActiveToolType(null);
      } else {
        setSelection(null);
        // Don't auto close panel, user might be looking at feedback
      }
    }
  };

  const handleResolveFeedback = (feedbackId: string) => {
    setEssays(prev => prev.map(e => {
        if (e.id !== activeEssayId) return e;
        return {
            ...e,
            feedback: e.feedback.map(f => f.id === feedbackId ? { ...f, isResolved: true } : f)
        };
    }));
  };

  const handleDownload = () => {
    // Basic .doc export simulation (HTML content)
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${activeEssay.title}</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + `<h1>${activeEssay.title}</h1><h3>${activeEssay.school} - ${activeEssay.type}</h3><p>${activeEssay.prompt}</p><br/>` + activeEssay.content.replace(/\n/g, "<br/>") + footer;
    
    const sourceBlob = new Blob([sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(sourceBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeEssay.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveManual = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        setLastSaved(isEn ? 'Just now (Manual)' : '刚刚 (手动保存)');
    }, 500);
  };

  const insertText = (textToInsert: string) => {
    if (!textToInsert) return;
    const cursorPosition = textareaRef.current?.selectionStart || activeEssay.content.length;
    const newContent = activeEssay.content.slice(0, cursorPosition) + " " + textToInsert + " " + activeEssay.content.slice(cursorPosition);
    handleContentChange(newContent);
  };

  // --- AI Actions ---

  // 1. Text Polishing/Editing
  const runAiTool = async (promptType: 'Polishing' | 'Fix') => {
    if (!selection) return;
    setIsAiProcessing(true);
    setAiOptions(null);
    setAiSimpleResult(null);
    setActiveToolType(promptType);

    const contextText = selection.text; 

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = "";
      
      if (promptType === 'Polishing') {
          // Request structured options
          prompt = `
            Task: Rewrite the following college essay excerpt in 3 distinct styles.
            Original Text: "${contextText}"
            
            Output strictly as a JSON array of objects with keys: "label" (string), "text" (string), "reason" (short string).
            Styles to generate:
            1. "Academic" (More formal, sophisticated vocabulary)
            2. "Vivid" (More descriptive, sensory details)
            3. "Concise" (Punchy, direct, remove fluff)
            
            Language: English.
          `;
      } else if (promptType === 'Fix') {
          // Request strict fix
          prompt = `
            Task: Fix grammar, spelling, and punctuation errors in the following text.
            Original Text: "${contextText}"
            
            Output strictly as a JSON object: { "fixedText": "...", "changes": "Brief explanation of fixes" }
          `;
      }

      const response = await ai.models.generateContent({ 
          model: 'gemini-3-flash-preview', 
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        const json = JSON.parse(response.text);
        if (promptType === 'Polishing' && Array.isArray(json)) {
            setAiOptions(json);
        } else if (promptType === 'Fix' && json.fixedText) {
            setAiOptions([{ label: 'Fixed Version', text: json.fixedText, reason: json.changes }]);
        }
      }
    } catch (e) {
      console.error(e);
      setAiSimpleResult(isEn ? "AI service busy." : "AI 服务繁忙。");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 2. Expand Tool (Still simple append)
  const runExpandTool = async () => {
    setIsAiProcessing(true);
    const contextText = selection ? selection.text : activeEssay.content.slice(-500);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Based on the context: "${contextText}", suggest 2-3 sentences to continue the thought flow for a college essay. Do not repeat. Keep it natural.`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        if (response.text) setAiSimpleResult(response.text.trim());
    } catch(e) { console.error(e); } 
    finally { setIsAiProcessing(false); }
  };

  const applyAiOption = (textToApply: string) => {
    if (!textToApply) return;
    let newContent = activeEssay.content;
    
    // If expanding (no selection replacement, just append or insert at cursor)
    if (!selection && activeToolType !== 'Polishing' && activeToolType !== 'Fix') {
        newContent = activeEssay.content + " " + textToApply;
    } else if (selection) {
        // Replace selection
        newContent = activeEssay.content.substring(0, selection.start) + textToApply + activeEssay.content.substring(selection.end);
    }
    
    handleContentChange(newContent);
    setAiOptions(null);
    setAiSimpleResult(null);
    setSelection(null);
    setActiveToolType(null);
  };

  // --- Translation Logic (Kept same) ---
  const handleTranslate = async () => {
    if (!chineseInput.trim()) return;
    setIsAiProcessing(true);
    setTranslationResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Translate to high-quality English for college essay: "${chineseInput}"`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (response.text) setTranslationResult(response.text.trim());
    } catch (e) { console.error(e); } 
    finally { setIsAiProcessing(false); }
  };

  const insertTranslation = () => {
    if (!translationResult) return;
    insertText(translationResult);
    setTranslationResult(null);
    setChineseInput('');
  };

  return (
    <div className="flex h-full animate-in fade-in slide-in-from-bottom-2 overflow-hidden relative bg-[#fcfcfc] dark:bg-zinc-950">
      
      {/* 1. LEFT SIDEBAR: Task List */}
      <div 
        className={`bg-white dark:bg-zinc-900 border-r border-[#e5e0dc] dark:border-white/5 flex flex-col transition-all duration-300 ease-in-out
            ${isZenMode ? 'w-0 opacity-0 overflow-hidden' : 'w-64 opacity-100'}
        `}
      >
         <div className="p-4 border-b border-[#e5e0dc] dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 text-sm flex items-center gap-2">
               <FileText className="w-4 h-4 text-violet-600" /> {isEn ? 'Essay Tasks' : '文书任务清单'}
            </h3>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {essays.map(essay => (
               <div 
                  key={essay.id}
                  onClick={() => setActiveEssayId(essay.id)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all group relative
                     ${activeEssayId === essay.id 
                        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-500/30' 
                        : 'bg-white dark:bg-zinc-900 border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}
                  `}
               >
                  {essay.status === 'Drafting' && <div className="absolute left-0 top-3 bottom-3 w-1 bg-violet-500 rounded-r"></div>}
                  <div className="pl-2">
                     <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${activeEssayId === essay.id ? 'text-violet-600' : 'text-gray-400'}`}>
                        {essay.school}
                     </p>
                     <p className={`text-sm font-bold leading-tight mb-1 ${activeEssayId === essay.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>
                        {essay.title}
                     </p>
                     <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${essay.status === 'Drafting' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{essay.status}</span>
                        <span className={`text-[10px] flex items-center gap-1 ${new Date(essay.deadline) < new Date() ? 'text-red-500 font-bold' : 'text-gray-400'}`}><Clock className="w-2.5 h-2.5" /> {essay.deadline}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 2. CENTER: Editor Area */}
      <div className="flex-1 flex flex-col relative h-full min-w-0">
         
         {/* Top Bar */}
         <div className="border-b border-gray-100 dark:border-white/5 bg-white dark:bg-zinc-900 flex-shrink-0 z-20">
            <div className="h-14 flex items-center justify-between px-6">
               <div className="flex items-center gap-3 min-w-0">
                  {isZenMode && (
                      <button onClick={() => setIsZenMode(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded" title="Show Sidebar">
                          <ChevronRight className="w-4 h-4 text-gray-500"/>
                      </button>
                  )}
                  <div className="flex flex-col truncate">
                     <div className="flex items-center gap-2">
                        <h2 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">{activeEssay.title}</h2>
                        <span className="text-xs text-gray-400 hidden sm:inline">@ {activeEssay.school}</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-full">
                     <span className={`${wordCount > activeEssay.wordLimit ? 'text-red-500 font-bold' : ''}`}>{wordCount}</span>
                     <span className="text-gray-300">/</span>
                     <span>{activeEssay.wordLimit} words</span>
                  </div>
                  <span className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                     {isSaving ? 'Saving...' : <CheckCircle className="w-3 h-3 text-green-500"/>}
                  </span>
                  
                  <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

                  <button onClick={handleSaveManual} title={isEn ? "Save" : "保存"} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"><Save className="w-4 h-4"/></button>
                  <button onClick={handleDownload} title={isEn ? "Download Word" : "下载 Word"} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"><FileDown className="w-4 h-4"/></button>
                  
                  <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

                  <button onClick={() => setIsZenMode(!isZenMode)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                     {isZenMode ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
                  </button>
                  <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className={`p-2 rounded-lg transition-colors ${isRightPanelOpen ? 'bg-gray-100 dark:bg-white/10 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}>
                     <MessageSquare className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Prompt Display */}
            <div className={`px-6 overflow-hidden transition-all duration-300 border-t border-gray-50 dark:border-white/5 ${isPromptExpanded ? 'max-h-60 py-4' : 'max-h-0 py-0'}`}>
               <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 p-4 rounded-xl relative group">
                  <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase mb-1">Essay Prompt</p>
                  <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed font-serif">{activeEssay.prompt}</p>
                  <button onClick={() => setIsPromptExpanded(false)} className="absolute top-2 right-2 p-1 text-yellow-700/50 hover:text-yellow-700 transition-colors"><ChevronUp className="w-4 h-4" /></button>
               </div>
            </div>
            {!isPromptExpanded && (
               <div className="flex justify-center -mt-3 relative z-10">
                  <button onClick={() => setIsPromptExpanded(true)} className="bg-white dark:bg-zinc-800 border border-t-0 border-gray-100 dark:border-white/10 px-3 py-0.5 rounded-b-lg shadow-sm text-[10px] text-gray-400 hover:text-primary-600 flex items-center gap-1 transition-colors">
                     Show Prompt <ChevronDown className="w-3 h-3" />
                  </button>
               </div>
            )}
         </div>

         {/* Editor */}
         <div className="flex-1 overflow-y-auto relative custom-scrollbar">
            <div className={`mx-auto h-full py-12 px-8 transition-all duration-300 ${isZenMode ? 'max-w-4xl' : 'max-w-3xl'}`}>
               <textarea 
                  ref={textareaRef}
                  className="w-full h-full min-h-[60vh] resize-none outline-none text-lg leading-loose text-gray-800 dark:text-zinc-200 font-serif bg-transparent placeholder:text-gray-300 dark:placeholder:text-zinc-700 selection:bg-violet-200 dark:selection:bg-violet-900/50"
                  placeholder={isEn ? "Start writing your story here..." : "在此开始书写你的故事..."}
                  value={activeEssay.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onSelect={handleSelect}
                  spellCheck={false}
               />
            </div>
         </div>
      </div>

      {/* 3. RIGHT SIDEBAR: The Copilot */}
      <div 
         className={`bg-white dark:bg-zinc-900 border-l border-[#e5e0dc] dark:border-white/5 flex flex-col transition-all duration-300 ease-in-out shadow-[-4px_0_15px_rgba(0,0,0,0.02)]
            ${isRightPanelOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full overflow-hidden'}
         `}
      >
         {/* Tabs */}
         <div className="flex p-2 border-b border-gray-100 dark:border-white/5">
            {[
               { id: 'Brief', icon: User, label: isEn ? 'Brief' : '指引' },
               { id: 'Inspiration', icon: Lightbulb, label: isEn ? 'Ideas' : '灵感' },
               { id: 'Tools', icon: Wand2, label: isEn ? 'Tools' : '助手' },
               { id: 'Feedback', icon: MessageSquare, label: isEn ? 'Review' : '审阅' }
            ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setRightPanelTab(tab.id as any)}
                  className={`flex-1 py-2 text-[10px] lg:text-xs font-bold rounded-lg flex flex-col lg:flex-row items-center justify-center gap-1 transition-colors
                     ${rightPanelTab === tab.id 
                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' 
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}
                  `}
               >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'Feedback' && activeEssay.feedback.filter(f => !f.isResolved).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 -ml-0.5 mb-2 lg:mb-0"></span>}
               </button>
            ))}
         </div>

         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {/* --- TAB 1: TEACHER BRIEF (NEW) --- */}
            {rightPanelTab === 'Brief' && (
               <div className="space-y-4">
                  {MOCK_BRIEFS.map(brief => (
                     <div key={brief.id} className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4 shadow-sm relative group">
                        <div className="flex items-center gap-3 mb-3 border-b border-indigo-200 dark:border-indigo-500/20 pb-2">
                           <img src={brief.avatar} className="w-8 h-8 rounded-full border border-indigo-200" alt="avatar" />
                           <div>
                              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">{brief.author}</p>
                              <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{brief.date}</p>
                           </div>
                        </div>
                        
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-2">{brief.title}</h4>
                        <div className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                           {brief.content}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                           {brief.tags.map(tag => (
                              <span key={tag} className="text-[9px] bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-indigo-300">#{tag}</span>
                           ))}
                        </div>

                        <button 
                           onClick={() => insertText(brief.content)}
                           className="absolute top-3 right-3 p-1.5 bg-white dark:bg-zinc-800 rounded-lg text-indigo-500 hover:text-indigo-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                           title={isEn ? "Insert into editor" : "插入到编辑器"}
                        >
                           <Copy className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  ))}
                  
                  {MOCK_BRIEFS.length === 0 && (
                     <div className="text-center py-10 text-gray-400 text-xs">
                        {isEn ? 'No guidance from counselor yet.' : '暂无顾问指引。'}
                     </div>
                  )}
               </div>
            )}

            {/* --- TAB 2: INSPIRATION (Activities) --- */}
            {rightPanelTab === 'Inspiration' && (
               <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                     <p className="text-xs text-yellow-800 dark:text-yellow-500 font-bold mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> {isEn ? 'Profile Match' : '素材匹配推荐'}</p>
                     <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{isEn ? 'Ideas based on profile:' : '基于你的履历推荐的写作方向：'}</p>
                  </div>
                  {MOCK_ACTIVITIES.map(act => (
                     <div key={act.id} className="border border-gray-200 dark:border-white/10 rounded-xl p-3 bg-white dark:bg-zinc-800 group relative hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                        <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 mb-1">{act.title}</p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-500 line-clamp-2">{act.description}</p>
                        <button 
                           onClick={() => insertText(act.description)}
                           className="absolute top-2 right-2 p-1 text-gray-300 hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                           <ArrowRight className="w-3 h-3" />
                        </button>
                     </div>
                  ))}
               </div>
            )}

            {/* --- TAB 3: TOOLS --- */}
            {rightPanelTab === 'Tools' && (
               <div className="space-y-6">
                  {/* Chinese Helper */}
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Languages className="w-3 h-3" /> {isEn ? 'Chinese to English' : '中英写作助手'}
                     </p>
                     <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl p-1 focus-within:ring-2 focus-within:ring-violet-100">
                        <textarea 
                           className="w-full p-3 text-xs bg-transparent outline-none resize-none h-20 text-gray-800 dark:text-zinc-200 placeholder:text-gray-400"
                           placeholder={isEn ? "Type Chinese idea..." : "输入中文想法，AI 帮你翻译..."}
                           value={chineseInput}
                           onChange={(e) => setChineseInput(e.target.value)}
                        />
                        {translationResult ? (
                           <div className="px-3 pb-3">
                              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded text-xs text-violet-800 dark:text-violet-200 mb-2 italic">"{translationResult}"</div>
                              <div className="flex gap-2">
                                 <button onClick={insertTranslation} className="flex-1 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700">{isEn ? 'Insert' : '插入'}</button>
                                 <button onClick={() => setTranslationResult(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{isEn ? 'Retry' : '重试'}</button>
                              </div>
                           </div>
                        ) : (
                           <div className="px-3 pb-3 flex justify-end">
                              <button onClick={handleTranslate} disabled={!chineseInput.trim() || isAiProcessing} className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                                 {isAiProcessing ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Languages className="w-3 h-3"/>} {isEn ? 'Translate' : '翻译'}
                              </button>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-white/10"></div>

                  {/* Polishing Tools */}
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> {isEn ? 'Polishing Tools' : '润色工具'}
                     </p>
                     
                     {!selection ? (
                        <div className="p-4 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-xl text-center text-gray-400 text-xs">
                           {isEn ? 'Select text in editor to enable polishing.' : '在编辑器中选中文字以启用润色。'}
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in">
                           <button onClick={() => runAiTool('Polishing')} disabled={isAiProcessing} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-white/10 hover:border-violet-300 text-left group transition-all">
                              <Sparkles className="w-4 h-4 text-violet-500 mb-1 group-hover:scale-110 transition-transform" />
                              <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">{isEn ? 'Polish' : '润色'}</p>
                           </button>
                           <button onClick={() => runAiTool('Fix')} disabled={isAiProcessing} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-white/10 hover:border-green-300 text-left group transition-all">
                              <CheckCircle className="w-4 h-4 text-green-500 mb-1 group-hover:scale-110 transition-transform" />
                              <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">{isEn ? 'Fix Grammar' : '纠错'}</p>
                           </button>
                        </div>
                     )}

                     {/* AI Output: Structured Options or Simple Result */}
                     {isAiProcessing && (
                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500">
                           <RefreshCw className="w-4 h-4 animate-spin"/> {isEn ? 'AI is working...' : 'AI 正在思考...'}
                        </div>
                     )}

                     {/* Scenario A: Polishing Options (Cards) */}
                     {aiOptions && activeToolType === 'Polishing' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                           <div className="flex justify-between items-center mb-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{isEn ? 'Choose a version' : '选择一个版本'}</p>
                              <button onClick={() => setAiOptions(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3"/></button>
                           </div>
                           {aiOptions.map((opt, idx) => (
                              <div key={idx} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 hover:border-violet-300 transition-all cursor-pointer group" onClick={() => applyAiOption(opt.text)}>
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{opt.label}</span>
                                    <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{isEn ? 'Click to Apply' : '点击应用'}</span>
                                 </div>
                                 <p className="text-xs text-gray-700 dark:text-zinc-300 leading-snug">{opt.text}</p>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* Scenario B: Fix Grammar (Diff View) */}
                     {aiOptions && activeToolType === 'Fix' && (
                        <div className="bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-500/30 rounded-xl p-4 animate-in slide-in-from-top-2">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {isEn ? 'Grammar Fixed' : '语法已修正'}</span>
                              <button onClick={() => setAiOptions(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3"/></button>
                           </div>
                           <div className="space-y-2 text-xs">
                              <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded text-red-700 dark:text-red-400 line-through opacity-70">
                                 {selection?.text}
                              </div>
                              <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded text-green-700 dark:text-green-400 font-medium">
                                 {aiOptions[0].text}
                              </div>
                           </div>
                           {aiOptions[0].reason && <p className="text-[10px] text-gray-400 mt-2 italic">{aiOptions[0].reason}</p>}
                           <button onClick={() => applyAiOption(aiOptions[0].text)} className="w-full mt-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">
                              {isEn ? 'Accept Changes' : '接受修改'}
                           </button>
                        </div>
                     )}

                     {/* Scenario C: Simple Result (Expand etc) */}
                     {aiSimpleResult && (
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-violet-200 dark:border-violet-500/50 shadow-sm animate-in slide-in-from-top-2">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-violet-600 uppercase">AI Result</span>
                              <button onClick={() => setAiSimpleResult(null)}><X className="w-3 h-3 text-gray-400"/></button>
                           </div>
                           <p className="text-xs text-gray-700 dark:text-zinc-300 italic mb-2">"{aiSimpleResult}"</p>
                           <button onClick={() => applyAiOption(aiSimpleResult)} className="w-full py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700">
                              {isEn ? 'Insert' : '插入'}
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* TAB 4: FEEDBACK */}
            {rightPanelTab === 'Feedback' && (
               <div className="space-y-4">
                  {activeEssay.feedback.length === 0 ? (
                     <div className="text-center py-10 text-gray-400 text-xs">
                        {isEn ? 'No feedback yet.' : '暂无反馈。'}
                     </div>
                  ) : (
                     activeEssay.feedback.map(item => (
                        <div key={item.id} className={`p-4 rounded-xl border ${item.isResolved ? 'opacity-60 bg-gray-50' : 'bg-white border-orange-200 shadow-sm'}`}>
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700">{item.type}</span>
                              {!item.isResolved && <button onClick={() => handleResolveFeedback(item.id)} className="text-gray-400 hover:text-green-500"><CheckCircle className="w-4 h-4"/></button>}
                           </div>
                           <p className="text-xs text-gray-500 line-through mb-1">{item.originalText}</p>
                           <p className="text-sm font-medium text-gray-800">{item.comment}</p>
                        </div>
                     ))
                  )}
               </div>
            )}

         </div>
      </div>

    </div>
  );
};

export default StudentEssayWriter;

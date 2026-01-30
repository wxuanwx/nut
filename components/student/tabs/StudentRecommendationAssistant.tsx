
import React, { useState } from 'react';
import { 
  User, Plus, Edit, Trash2, Mail, CheckCircle, 
  Clock, Sparkles, Loader2, X, FileText, ChevronRight,
  Send, Quote, AlertCircle
} from '../../common/Icons';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../../../contexts/LanguageContext';

// --- Types ---
interface RecommendationRequest {
  id: string;
  recommenderName: string;
  role: string; // e.g. "AP Physics Teacher" or "Counselor"
  status: 'Drafting' | 'Invited' | 'In Progress' | 'Completed';
  deadline: string;
  highlights: string; // The "Why recommend me" / Brag sheet content
  aiPolished?: boolean;
}

// --- Mock Data ---
const INITIAL_REQUESTS: RecommendationRequest[] = [
  {
    id: '1',
    recommenderName: 'Ms. Sarah',
    role: 'School Counselor',
    status: 'Completed',
    deadline: '2024-11-01',
    highlights: 'Founded Robotics Club. Overcame team conflict during regional finals. Consistent GPA improver.',
    aiPolished: true
  },
  {
    id: '2',
    recommenderName: 'Mr. Wang',
    role: 'AP Calculus Teacher',
    status: 'Invited',
    deadline: '2024-11-15',
    highlights: 'Got A in all exams. Helped classmates with tutoring after school.',
    aiPolished: false
  }
];

const StudentRecommendationAssistant: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const [requests, setRequests] = useState<RecommendationRequest[]>(INITIAL_REQUESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<RecommendationRequest>>({
    recommenderName: '',
    role: '',
    deadline: '',
    highlights: ''
  });

  // AI State
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // --- Handlers ---

  const handleOpenModal = (req?: RecommendationRequest) => {
    if (req) {
      setEditingId(req.id);
      setFormData({ ...req });
    } else {
      setEditingId(null);
      setFormData({
        recommenderName: '',
        role: '',
        deadline: '',
        highlights: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isEn ? 'Delete this request?' : '确认删除此推荐信申请？')) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.recommenderName || !formData.role) return;

    const newRequest: RecommendationRequest = {
      id: editingId || Date.now().toString(),
      recommenderName: formData.recommenderName,
      role: formData.role,
      deadline: formData.deadline || '',
      highlights: formData.highlights || '',
      status: (formData.status as any) || 'Drafting',
      aiPolished: formData.aiPolished || false
    };

    if (editingId) {
      setRequests(prev => prev.map(r => r.id === editingId ? newRequest : r));
    } else {
      setRequests(prev => [...prev, newRequest]);
    }
    setIsModalOpen(false);
  };

  const handleGenerateBragSheet = async () => {
    if (!formData.highlights?.trim()) return;
    setIsAiGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Role: College Application Consultant.
        Task: Polish a student's raw inputs for a "Brag Sheet" (materials for a recommender to write a letter).
        
        Student's Raw Input: "${formData.highlights}"
        Target Recommender Role: "${formData.role}"
        
        Requirements:
        1. Transform the raw input into 3-4 professional bullet points.
        2. Highlight specific qualities (e.g., Intellectual Curiosity, Leadership, Resilience).
        3. Make it easy for the teacher to reference in a formal letter.
        4. Output Language: ${isEn ? 'English' : 'English (with succinct phrasing)'}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      if (response.text) {
        setFormData(prev => ({
          ...prev,
          highlights: response.text.trim(),
          aiPolished: true
        }));
      }
    } catch (e) {
      console.error(e);
      alert(isEn ? 'AI generation failed.' : 'AI 生成失败，请稍后重试。');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Helper: Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <span className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded text-xs font-bold border border-green-100 dark:border-green-500/20"><CheckCircle className="w-3 h-3" /> {isEn ? 'Submitted' : '已提交'}</span>;
      case 'In Progress': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded text-xs font-bold border border-blue-100 dark:border-blue-500/20"><Clock className="w-3 h-3" /> {isEn ? 'Writing' : '撰写中'}</span>;
      case 'Invited': return <span className="flex items-center gap-1 text-violet-600 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded text-xs font-bold border border-violet-100 dark:border-violet-500/20"><Mail className="w-3 h-3" /> {isEn ? 'Invited' : '已邀请'}</span>;
      default: return <span className="flex items-center gap-1 text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-xs font-bold border border-gray-200 dark:border-white/10"><FileText className="w-3 h-3" /> {isEn ? 'Drafting' : '草稿'}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 overflow-y-auto custom-scrollbar bg-[#fcfcfc] dark:bg-zinc-950/50">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Quote className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            {isEn ? 'Recommendation Assistant' : '推荐信助手'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 ml-1 max-w-xl">
            {isEn 
              ? 'Manage your recommenders and provide them with "Brag Sheets" to get the best letters.' 
              : '管理您的推荐人，并利用 AI 润色您的"高光素材" (Brag Sheet)，帮助老师写出更有力的推荐信。'}
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" /> {isEn ? 'Add Recommender' : '添加推荐人'}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Request Cards */}
        {requests.map(req => (
          <div key={req.id} className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            {/* Top Row: Info */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 
                  ${req.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/20 dark:border-violet-500/30 dark:text-violet-300'}`}>
                  {req.recommenderName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{req.recommenderName}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{req.role}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(req.status)}
                {req.deadline && (
                  <span className={`text-[10px] flex items-center gap-1 ${new Date(req.deadline) < new Date() ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    <Clock className="w-3 h-3" /> Due {req.deadline}
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Highlights Preview */}
            <div className="mb-6 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-white/5 relative">
               <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-500" /> {isEn ? 'Highlights provided' : '提供的高光素材'}
               </p>
               <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed line-clamp-3 font-serif">
                  "{req.highlights || (isEn ? 'No highlights added yet.' : '暂未填写素材...')}"
               </p>
               {req.aiPolished && (
                 <div className="absolute top-3 right-3">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">AI Polished</span>
                 </div>
               )}
            </div>

            {/* Bottom: Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
               <button 
                 onClick={() => handleOpenModal(req)}
                 className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
               >
                 <Edit className="w-4 h-4" /> {isEn ? 'Edit Details' : '编辑详情'}
               </button>
               
               <div className="flex gap-2">
                 {req.status === 'Drafting' && (
                   <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors" title={isEn ? "Mark as Invited" : "标记为已邀请"}>
                      <Send className="w-4 h-4" />
                   </button>
                 )}
                 <button onClick={() => handleDelete(req.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <button 
          onClick={() => handleOpenModal()}
          className="group border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-violet-300 hover:bg-violet-50/30 dark:hover:border-violet-700 dark:hover:bg-violet-900/10 transition-all min-h-[240px]"
        >
           <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-white group-hover:shadow-md">
              <Plus className="w-8 h-8 text-gray-300 group-hover:text-violet-500 transition-colors" />
           </div>
           <p className="font-bold text-sm group-hover:text-violet-600 transition-colors">{isEn ? 'Add New Recommender' : '添加新的推荐人'}</p>
        </button>

      </div>

      {/* --- Edit/Create Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
           <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              
              <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                 <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-600" /> {editingId ? (isEn ? 'Edit Request' : '编辑申请') : (isEn ? 'New Recommendation Request' : '新建推荐信申请')}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase mb-1.5">{isEn ? 'Recommender Name' : '推荐人姓名'}</label>
                       <input 
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all text-gray-900 dark:text-white"
                          placeholder={isEn ? "e.g. Mr. Smith" : "例如：王老师"}
                          value={formData.recommenderName}
                          onChange={e => setFormData({...formData, recommenderName: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase mb-1.5">{isEn ? 'Role / Subject' : '角色 / 学科'}</label>
                       <input 
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all text-gray-900 dark:text-white"
                          placeholder={isEn ? "e.g. Math Teacher" : "例如：数学老师"}
                          value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase mb-1.5">{isEn ? 'Deadline (Optional)' : '截止日期 (可选)'}</label>
                    <input 
                       type="date"
                       className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all text-gray-900 dark:text-white"
                       value={formData.deadline}
                       onChange={e => setFormData({...formData, deadline: e.target.value})}
                    />
                 </div>

                 <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-xl border border-violet-100 dark:border-violet-500/20">
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold text-violet-800 dark:text-violet-300 uppercase flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> {isEn ? 'Why Recommend Me? (Brag Sheet)' : '为什么推荐我？(素材)'}
                       </label>
                       <button 
                          onClick={handleGenerateBragSheet}
                          disabled={isAiGenerating || !formData.highlights}
                          className="text-[10px] bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-300 px-2 py-1 rounded-lg border border-violet-200 dark:border-violet-500/30 font-bold hover:bg-violet-50 dark:hover:bg-violet-900/30 flex items-center gap-1 shadow-sm disabled:opacity-50 transition-colors"
                       >
                          {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                          {isEn ? 'AI Polish' : 'AI 润色'}
                       </button>
                    </div>
                    <textarea 
                       className="w-full bg-white dark:bg-zinc-800 border border-violet-200 dark:border-violet-500/30 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 min-h-[120px] resize-none placeholder:text-gray-400 text-gray-800 dark:text-zinc-200 leading-relaxed"
                       placeholder={isEn 
                         ? "List your achievements, class participation, or specific projects you did with this teacher. Don't worry about grammar, AI will help." 
                         : "列出你在该老师课上的表现、项目经历或具体事例。不用担心格式，输入要点后点击「AI 润色」即可生成专业的 Brag Sheet。"}
                       value={formData.highlights}
                       onChange={e => setFormData({...formData, highlights: e.target.value})}
                    />
                 </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    {isEn ? 'Cancel' : '取消'}
                 </button>
                 <button 
                    onClick={handleSave}
                    disabled={!formData.recommenderName || !formData.role}
                    className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isEn ? 'Save Request' : '保存申请'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default StudentRecommendationAssistant;

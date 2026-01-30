
import React, { useState, useMemo } from 'react';
import { TimelineEvent } from './PlanningData';
import { 
  Plus, Trash2, Edit, Calendar, Clock, CheckCircle, 
  AlertCircle, X, Save, User, Users, Briefcase, 
  ChevronDown, ChevronUp, GripVertical, CheckSquare, List,
  Flag
} from '../../common/Icons';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Step6Props {
  timelineEvents: TimelineEvent[];
  setTimelineEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
  onComplete?: () => void;
}

const Step6Timeline: React.FC<Step6Props> = ({ timelineEvents, setTimelineEvents, onComplete }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  // --- State ---
  const [filterRole, setFilterRole] = useState<'All' | 'Student' | 'Counselor'>('All');
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    title: '',
    startDate: '',
    endDate: '',
    type: 'Point',
    category: 'Other',
    priority: 'Medium',
    status: 'Pending',
    description: '',
    assignee: 'Student'
  });

  // --- Helpers ---

  // Generate a list of months for the view (e.g., next 12 months starting from earliest event or now)
  const monthKeys = useMemo(() => {
    const keys = new Set<string>();
    // Default: Current month + next 11 months
    const now = new Date();
    for(let i=0; i<12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        keys.add(k);
    }
    // Add months from existing events
    timelineEvents.forEach(e => {
        if (e.startDate && e.startDate.match(/^\d{4}-\d{2}/)) {
            keys.add(e.startDate.substring(0, 7));
        }
    });
    return Array.from(keys).sort();
  }, [timelineEvents]);

  const formatMonth = (ym: string) => {
      const [y, m] = ym.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1);
      return date.toLocaleDateString(isEn ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'long' });
  };

  const getRoleStyles = (role: string) => {
      if (role === 'Student') return 'border-l-4 border-purple-500 bg-purple-50/40 hover:bg-purple-50';
      if (role === 'Counselor') return 'border-l-4 border-primary-500 bg-primary-50/40 hover:bg-primary-50';
      return 'border-l-4 border-gray-300 bg-white hover:bg-gray-50';
  };

  const getPriorityBadge = (p: string) => {
      if (p === 'High') return <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-0.5"><AlertCircle className="w-2.5 h-2.5"/> P0</span>;
      if (p === 'Medium') return <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">P1</span>;
      return <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">P2</span>;
  };

  // --- Handlers ---

  const handleOpenAdd = () => {
    setEditingId(null);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setFormData({
      title: '', startDate: currentMonth, endDate: '', type: 'Point',
      category: 'Other', priority: 'Medium', status: 'Pending', description: '', assignee: 'Student'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setFormData({ ...event });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title) return;
    const newEvent: TimelineEvent = {
        ...formData,
        id: editingId || `evt-${Date.now()}`,
        title: formData.title || 'Untitled',
        startDate: formData.startDate || '',
        category: formData.category || 'Other',
        status: formData.status || 'Pending',
        priority: formData.priority || 'Medium',
        assignee: formData.assignee || 'Student',
        type: formData.type || 'Point',
        // Creating in Timeline implies it's a Milestone/Task
        isMilestone: true 
    } as TimelineEvent;

    if (editingId) {
        setTimelineEvents(prev => prev.map(e => e.id === editingId ? newEvent : e));
    } else {
        setTimelineEvents(prev => [...prev, newEvent]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(isEn ? 'Delete this event?' : '确认删除此事件？')) {
        setTimelineEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTimelineEvents(prev => prev.map(e => 
        e.id === id ? { ...e, status: e.status === 'Done' ? 'Pending' : 'Done' } : e
    ));
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
      setDraggingId(id);
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
      setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, monthKey: string) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (id) {
          setTimelineEvents(prev => prev.map(evt => {
              if (evt.id === id) {
                  return { ...evt, startDate: monthKey };
              }
              return evt;
          }));
          setDraggingId(null);
      }
  };

  // --- Filtering ---
  const scheduledEvents = timelineEvents.filter(e => e.startDate && (filterRole === 'All' || e.assignee === filterRole));
  const unscheduledEvents = timelineEvents.filter(e => !e.startDate && (filterRole === 'All' || e.assignee === filterRole));

  return (
    <div className="h-full flex flex-col bg-white relative">
        {/* Header Toolbar */}
        <div className="flex justify-between items-center mb-6 pt-2 px-2">
            <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary-600" /> {isEn ? 'Timeline & Tasks' : '申请规划时间轴'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {isEn ? 'Single source of truth for all tasks.' : '所有任务的单一真实数据源，支持拖拽排期。'}
                </p>
            </div>
            <div className="flex gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['All', 'Student', 'Counselor'] as const).map(role => (
                        <button key={role} onClick={() => setFilterRole(role)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${filterRole === role ? 'bg-white shadow text-primary-700' : 'text-gray-500'}`}>
                            {role === 'Student' && <User className="w-3 h-3"/>}
                            {role === 'Counselor' && <Briefcase className="w-3 h-3"/>}
                            {role === 'All' ? (isEn ? 'All' : '全部') : (isEn ? role : (role === 'Student' ? '学生' : '顾问'))}
                        </button>
                    ))}
                </div>
                <button onClick={handleOpenAdd} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-black transition-colors">
                    <Plus className="w-4 h-4" /> {isEn ? 'Add Task' : '添加任务'}
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-20 custom-scrollbar space-y-8">
            
            {/* 1. Unscheduled Pool (Collapsible) - Updated background to white */}
            <div className={`border border-dashed border-gray-300 rounded-xl bg-white transition-all duration-300 ${isUnscheduledOpen ? 'p-4' : 'p-2'}`}>
                <div 
                    className="flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setIsUnscheduledOpen(!isUnscheduledOpen)}
                >
                    <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <List className="w-4 h-4" /> {isEn ? 'Unscheduled Tasks' : '待排期任务池'} 
                        <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{unscheduledEvents.length}</span>
                    </h3>
                    {isUnscheduledOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {isUnscheduledOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {unscheduledEvents.length > 0 ? unscheduledEvents.map(evt => (
                            <div 
                                key={evt.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, evt.id)}
                                onDragEnd={handleDragEnd}
                                className={`bg-white p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all flex flex-col gap-2 relative ${getRoleStyles(evt.assignee)}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-3 h-3 text-gray-300" />
                                        <span className="text-sm font-bold text-gray-800 line-clamp-1">{evt.title}</span>
                                    </div>
                                    {getPriorityBadge(evt.priority)}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 pl-5">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{evt.category}</span>
                                    <span className="flex items-center gap-1">{evt.assignee === 'Student' ? <User className="w-3 h-3"/> : <Briefcase className="w-3 h-3"/>}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-6 text-gray-400 text-xs italic">
                                {isEn ? 'All tasks are scheduled.' : '暂无待排期任务。'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Monthly Groups */}
            <div className="space-y-8">
                {monthKeys.map(month => {
                    const eventsInMonth = scheduledEvents.filter(e => e.startDate.startsWith(month));
                    // If no events and month is in past, maybe skip? Keeping for timeline continuity.
                    
                    return (
                        <div 
                            key={month} 
                            className="relative"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, month)}
                        >
                            {/* Sticky Header */}
                            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-800">{formatMonth(month)}</h3>
                                    <span className="text-xs font-mono text-gray-400">{month}</span>
                                </div>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{eventsInMonth.length} {isEn ? 'Tasks' : '任务'}</span>
                            </div>

                            {/* Drop Zone Visual Hint */}
                            {draggingId && (
                                <div className="absolute inset-0 bg-blue-50/30 border-2 border-dashed border-blue-300 rounded-xl pointer-events-none z-0 flex items-center justify-center">
                                    <span className="text-blue-400 font-bold text-sm bg-white px-3 py-1 rounded shadow-sm">Drop here to schedule</span>
                                </div>
                            )}

                            {/* Task List */}
                            <div className="space-y-3 relative z-10">
                                {eventsInMonth.length > 0 ? eventsInMonth.map(evt => (
                                    <div key={evt.id} draggable onDragStart={(e) => handleDragStart(e, evt.id)} onDragEnd={handleDragEnd} className={`flex items-stretch bg-white border rounded-xl shadow-sm transition-all hover:shadow-md overflow-hidden ${getRoleStyles(evt.assignee)}`}>
                                        {/* Status Checkbox Area */}
                                        <div className="w-12 flex items-center justify-center border-r border-gray-100/50 bg-white/50 cursor-pointer hover:bg-gray-100/50" onClick={() => handleToggleStatus(evt.id)}>
                                            {evt.status === 'Done' 
                                                ? <CheckCircle className="w-5 h-5 text-green-500" />
                                                : <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-primary-500 transition-colors"></div>
                                            }
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 p-3 flex flex-col justify-center min-w-0" onClick={() => handleOpenEdit(evt)}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`text-sm font-bold truncate cursor-pointer hover:underline ${evt.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                    {evt.title}
                                                </h4>
                                                {evt.sourceActionId && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-100">AI Gen</span>}
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                {evt.tags?.map(t => <span key={t} className="bg-gray-100 px-1.5 rounded text-[10px]">#{t}</span>)}
                                            </div>
                                        </div>

                                        {/* Meta Right */}
                                        <div className="w-32 p-3 flex flex-col justify-center items-end border-l border-gray-100/50 bg-gray-50/30 text-xs">
                                            {getPriorityBadge(evt.priority)}
                                            <span className={`mt-1 font-mono ${evt.status === 'Done' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {evt.startDate}
                                            </span>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                                {evt.assignee === 'Student' 
                                                    ? <><img src="https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=d1d4f9" className="w-4 h-4 rounded-full"/> Student</>
                                                    : <><img src="https://api.dicebear.com/7.x/micah/svg?seed=Sarah&backgroundColor=ffdfbf" className="w-4 h-4 rounded-full"/> Counselor</>
                                                }
                                            </div>
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="w-10 flex flex-col items-center justify-center border-l border-gray-100 opacity-0 hover:opacity-100 transition-opacity bg-gray-50">
                                            <button onClick={() => handleDelete(evt.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-4 text-center text-gray-300 text-xs border border-dashed border-gray-200 rounded-lg">
                                        {isEn ? 'No tasks scheduled' : '本月无任务'}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Footer Actions */}
        {onComplete && (
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end sticky bottom-0 z-20">
                <button 
                    onClick={onComplete}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-full font-bold shadow-lg hover:bg-green-700 transition-all hover:scale-105 active:scale-95"
                >
                    <Flag className="w-4 h-4" /> {isEn ? 'Complete Planning' : '完成规划'}
                </button>
            </div>
        )}

        {/* --- Edit Modal --- */}
        {isModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl">
                <div className="bg-white w-[400px] rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
                    <h3 className="font-bold text-gray-900 mb-4">{editingId ? (isEn ? 'Edit Task' : '编辑任务') : (isEn ? 'New Task' : '新建任务')}</h3>
                    <div className="space-y-3">
                        <input className="w-full border p-2 rounded text-sm outline-none focus:border-primary-500" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="month" className="w-full border p-2 rounded text-sm" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            <select className="w-full border p-2 rounded text-sm" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select className="w-full border p-2 rounded text-sm" value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value as any})}>
                                <option value="Student">Student</option>
                                <option value="Counselor">Counselor</option>
                            </select>
                            <select className="w-full border p-2 rounded text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                                <option value="Application">Application</option>
                                <option value="Exam">Exam</option>
                                <option value="Activity">Activity</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">{isEn ? 'Cancel' : '取消'}</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-900 text-white rounded font-bold">{isEn ? 'Save' : '保存'}</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Step6Timeline;


import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, AlertTriangle, Clock, ChevronDown, MessageSquare } from '../common/Icons';
import { StudentSummary, RiskLevel } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { MOCK_STUDENTS } from '../../data/staticData';

interface StudentListProps {
  onStudentClick: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ onStudentClick }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ grade: '全部', direction: '全部' });

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => {
       const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
       const matchesGrade = filters.grade === '全部' || s.grade === filters.grade;
       return matchesSearch && matchesGrade;
    });
  }, [searchQuery, filters]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#e5e0dc] dark:border-white/5 flex flex-col h-full min-h-[600px] transition-colors duration-300">
      <div className="p-5 border-b border-[#e5e0dc] dark:border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEn ? 'Students' : '学生管理'}</h2>
          <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> {isEn ? 'New Student' : '新建学生'}
          </button>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-primary-300"
               placeholder={isEn ? "Search Name..." : "搜索姓名..."}
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
            <thead className="bg-[#fbf7f5] dark:bg-zinc-900 sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{isEn ? 'Student Info' : '学生信息'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{isEn ? 'Phase' : '阶段'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{isEn ? 'Next Task' : '下一步待办'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">{isEn ? 'Actions' : '操作'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-primary-50/30 dark:hover:bg-white/5 cursor-pointer" onClick={() => navigate(`/teacher/students/${student.id}`)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatarUrl} className="w-10 h-10 rounded-full border border-gray-200" alt={student.name}/>
                      <div><p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p><p className="text-xs text-gray-500">{student.grade}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">{student.phase}</span>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-sm text-gray-800 dark:text-zinc-200">{student.nextTask}</p>
                     <p className="text-xs text-red-600 flex items-center gap-1"><Clock className="w-3 h-3"/>{student.nextTaskDue}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
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


import React, { useState } from 'react';
import { 
  Mail, CheckCircle, Edit, AlertCircle, Eye, X, Quote
} from '../common/Icons';
import { useLanguage } from '../../contexts/LanguageContext';

const StudentRecommendations: React.FC = () => {
  const [viewContent, setViewContent] = useState<string | null>(null);
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const mockContent = `Dear Admissions Committee,

It is my absolute pleasure to recommend Alex for admission to your computer science program. I have had the joy of serving as Alex's counselor for the past three years at Ascent International School.

Alex is an exceptional student who combines sharp intellect with genuine curiosity. His passion for computer science goes beyond the classroom; he founded the school's Robotics Club and led the team to a regional victory last year. What strikes me most is his resilience—when the robot failed during the preliminaries, instead of giving up, he rallied his team to debug the code overnight.

Academically, Alex maintains a rigorous course load while exploring interdisciplinary connections. His ability to articulate complex technical concepts to non-technical peers during our science fairs demonstrates his strong communication skills.

I am confident Alex will thrive in your community. He is a builder, a leader, and a thoughtful young man.

Sincerely,
Ms. Sarah`;

  return (
     <div className="animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col relative">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-gray-800 text-lg">{isEn ? 'Recommendations' : '推荐信管理'}</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e0dc] overflow-hidden">
           <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-4">{isEn ? 'Recommender' : '推荐人'}</th>
                    <th className="px-6 py-4">{isEn ? 'Role/Subject' : '角色/学科'}</th>
                    <th className="px-6 py-4">{isEn ? 'Brag Sheet' : 'Brag Sheet (学生素材)'}</th>
                    <th className="px-6 py-4">{isEn ? 'Status' : '撰写状态'}</th>
                    <th className="px-6 py-4">{isEn ? 'Content' : '推荐信内容'}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 <tr>
                    <td className="px-6 py-4 font-bold text-gray-800">Ms. Sarah</td>
                    <td className="px-6 py-4 text-gray-600">Counselor</td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-100">
                          <CheckCircle className="w-3 h-3" /> {isEn ? 'Submitted' : '已提交'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-green-600 font-medium">{isEn ? 'Submitted' : '已提交'}</span>
                    </td>
                    <td className="px-6 py-4">
                       <button 
                          onClick={() => setViewContent(mockContent)}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-bold bg-primary-50 px-2 py-1 rounded border border-primary-100 hover:bg-primary-100 transition-colors"
                       >
                          <Eye className="w-3 h-3" /> {isEn ? 'View' : '查看内容'}
                       </button>
                    </td>
                 </tr>
                 <tr>
                    <td className="px-6 py-4 font-bold text-gray-800">Mr. Li</td>
                    <td className="px-6 py-4 text-gray-600">Math Teacher</td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs border border-red-100">
                          <AlertCircle className="w-3 h-3" /> {isEn ? 'Pending' : '待填报'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-gray-400">{isEn ? 'Not Started' : '未开始'}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-gray-300 text-xs">-</span>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>

        {/* Modal */}
        {viewContent && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div 
                 className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                 onClick={(e) => e.stopPropagation()}
              >
                 <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <Quote className="w-5 h-5 text-primary-600" /> {isEn ? 'Preview (Ms. Sarah)' : '推荐信预览 (Ms. Sarah)'}
                    </h3>
                    <button 
                       onClick={() => setViewContent(null)}
                       className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                       <X className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <div className="p-8 overflow-y-auto bg-white">
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-serif whitespace-pre-wrap">
                       {viewContent}
                    </div>
                 </div>

                 <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button 
                       onClick={() => setViewContent(null)}
                       className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm shadow-sm"
                    >
                       {isEn ? 'Close' : '关闭'}
                    </button>
                 </div>
              </div>
              <div className="absolute inset-0 -z-10" onClick={() => setViewContent(null)}></div>
           </div>
        )}
     </div>
  );
};

export default StudentRecommendations;


import React, { useState } from 'react';
import { Target, FileDown, School, MapPin, Sparkles, Loader2, ExternalLink, Link as LinkIcon, Zap, Info, ArrowRight } from '../../common/Icons';
import { SelectedSchool } from './PlanningData';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Step4Props {
  selectedSchools: SelectedSchool[];
  setPlanningStep: (step: number) => void;
  handleUpdateFinalSchool: (id: string, field: keyof SelectedSchool, value: string) => void;
  handleEnrichSchoolInfo: (id: string) => void;
  handleBatchEnrich: () => void;
  enrichingSchoolId: string | null;
  isBatchEnriching: boolean;
  onNext: () => void;
}

const Step4FinalList: React.FC<Step4Props> = ({
  selectedSchools, setPlanningStep,
  handleUpdateFinalSchool, handleEnrichSchoolInfo, handleBatchEnrich,
  enrichingSchoolId, isBatchEnriching, onNext
}) => {
  const [showAdviceInfo, setShowAdviceInfo] = useState(false);
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const handleExportExcel = () => {
    // CSV Header with BOM for Excel Chinese support
    const header = ['Region', 'Tier', 'School Name', 'Rank', 'Major', 'Official Requirements', 'Admission Advice', 'Deadlines', 'Process'];
    
    const rows = selectedSchools.map(s => {
      // Escape commas and double quotes for CSV format
      const escape = (text: string | undefined) => {
        if (!text) return '""';
        return `"${text.replace(/"/g, '""').replace(/\n/g, ' ')}"`; // Replace newlines with space to keep it simple in one cell
      };

      return [
        escape(s.uni.region),
        escape(s.tier),
        escape(s.uni.name),
        escape(s.uni.rank.toString()),
        escape(s.major),
        escape(s.requirements),
        escape(s.admissionAdvice),
        escape(s.deadlines),
        escape(s.process)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Final_School_List_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 flex flex-col min-h-full">
      <div className="flex-1 space-y-8">
        <div className="flex justify-between items-center">
           <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <Target className="w-6 h-6 text-primary-600" /> {isEn ? 'Final School List' : '最终选校清单 (Final School List)'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                 {isEn ? 'Refine application details. Use "AI Enrich All" to fetch missing official requirements.' : '请完善申请细节。使用 "AI 全局补全" 功能自动获取所有缺失的最新官网要求。'}
              </p>
           </div>
           <div className="flex gap-3">
              <button 
                onClick={handleBatchEnrich}
                disabled={isBatchEnriching || selectedSchools.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isBatchEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-300" />}
                 {isBatchEnriching ? (isEn ? 'Processing...' : 'AI 正在检索中...') : (isEn ? 'AI Enrich All' : 'AI 全局补全信息')}
              </button>
              <button 
                onClick={handleExportExcel}
                disabled={selectedSchools.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-600 shadow-sm transition-colors disabled:opacity-50"
              >
                 <FileDown className="w-4 h-4" /> {isEn ? 'Export Excel' : '导出 Excel'}
              </button>
           </div>
        </div>
        
        {selectedSchools.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{isEn ? 'No schools selected. Go back to Step 3.' : '暂无选校，请返回 Step 3 添加学校。'}</p>
              <button onClick={() => setPlanningStep(3)} className="mt-4 text-primary-600 text-sm font-bold hover:underline">{isEn ? 'Back to Selection' : '返回定校助手'}</button>
           </div>
        ) : (
           // Group by Region
           Object.entries(selectedSchools.reduce((acc, curr) => {
              const region = curr.uni.region;
              if (!acc[region]) acc[region] = [];
              acc[region].push(curr);
              return acc;
           }, {} as Record<string, SelectedSchool[]>)).map(([region, schools]: [string, SelectedSchool[]]) => (
              <div key={region} className="bg-white rounded-xl shadow-sm border border-[#e5e0dc] overflow-hidden">
                 <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <h3 className="font-bold text-gray-800">
                       {region === 'US' ? (isEn ? '🇺🇸 United States' : '🇺🇸 美国 (United States)') : 
                        region === 'UK' ? (isEn ? '🇬🇧 United Kingdom' : '🇬🇧 英国 (United Kingdom)') : 
                        region === 'HK' ? (isEn ? '🇭🇰 Hong Kong' : '🇭🇰 香港 (Hong Kong)') : 
                        region === 'SG' ? (isEn ? '🇸🇬 Singapore' : '🇸🇬 新加坡 (Singapore)') : region}
                    </h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                       {schools.length} Schools
                    </span>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                          <tr>
                             <th className="px-6 py-3 w-64">{isEn ? 'School' : '院校信息 (School)'}</th>
                             <th className="px-6 py-3 w-48">{isEn ? 'Major' : '申请专业 (Major)'}</th>
                             <th className="px-6 py-3 w-64">{isEn ? 'Official Requirements' : '官网录取要求 (Official Requirements)'}</th>
                             <th className="px-6 py-3 w-64 relative">
                                <div 
                                  className="flex items-center gap-1 cursor-pointer hover:text-primary-600 transition-colors w-fit"
                                  onClick={() => setShowAdviceInfo(!showAdviceInfo)}
                                >
                                  {isEn ? 'Admission Advice' : '实际录取建议 (Admission Advice)'} <Info className="w-3 h-3" />
                                </div>
                                {showAdviceInfo && (
                                  <>
                                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setShowAdviceInfo(false)}></div>
                                    <div className="absolute top-8 left-6 w-64 bg-gray-800 text-white text-xs p-3 rounded-lg shadow-xl z-20 leading-relaxed animate-in fade-in zoom-in-95">
                                      {isEn ? 'Based on 20,000+ real cases from Nut Education.' : '真实录取建议基于坚果留学2万+真实录取案例整理而成'}
                                      <div className="absolute -top-1 left-10 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                                    </div>
                                  </>
                                )}
                             </th>
                             <th className="px-6 py-3 w-48">{isEn ? 'Deadlines' : '关键时间 (Deadlines)'}</th>
                             <th className="px-6 py-3 w-40">{isEn ? 'Actions' : '操作 (Actions)'}</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {schools.map(item => (
                             <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                {/* School Info - Logo Removed */}
                                <td className="px-6 py-4 align-top">
                                   <div>
                                      <div className="font-bold text-gray-900">{item.uni.name}</div>
                                      <div className="text-xs text-gray-500 mt-0.5 flex gap-2">
                                         <span className={`font-medium ${item.tier === 'Reach' ? 'text-red-600' : item.tier === 'Match' ? 'text-primary-600' : 'text-green-600'}`}>
                                            {item.tier}
                                         </span>
                                         <span>#{item.uni.rank}</span>
                                      </div>
                                   </div>
                                </td>

                                {/* Major Display (Read Only) */}
                                <td className="px-6 py-4 align-top">
                                   <div className="py-1 text-gray-800 font-medium break-words">
                                      {item.major}
                                   </div>
                                </td>

                                {/* Requirements (Textarea + AI) */}
                                <td className="px-6 py-4 align-top relative">
                                   <textarea 
                                      className={`w-full bg-transparent border border-gray-200 rounded p-2 text-xs text-gray-600 focus:border-primary-500 outline-none resize-none h-24 focus:bg-white transition-all ${isBatchEnriching && !item.requirements ? 'animate-pulse bg-gray-50' : ''}`}
                                      placeholder={isEn ? "GPA, Tests, Soft skills..." : "GPA, 标化, 软性要求..."}
                                      value={item.requirements}
                                      onChange={(e) => handleUpdateFinalSchool(item.id, 'requirements', e.target.value)}
                                   />
                                   {!item.requirements && !isBatchEnriching && (
                                      <button 
                                         onClick={() => handleEnrichSchoolInfo(item.id)}
                                         className="absolute bottom-6 right-8 text-[10px] text-primary-600 bg-primary-50 px-2 py-1 rounded border border-primary-100 hover:bg-primary-100 flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                         <Sparkles className="w-3 h-3" /> {isEn ? 'AI Enrich' : 'AI 单项补全'}
                                      </button>
                                   )}
                                </td>

                                {/* Admission Advice (New Field) */}
                                <td className="px-6 py-4 align-top relative">
                                   <textarea 
                                      className="w-full bg-transparent border border-gray-200 rounded p-2 text-xs text-gray-600 focus:border-primary-500 outline-none resize-none h-24 focus:bg-white transition-all"
                                      placeholder={isEn ? "Experience-based advice..." : "基于经验的实际录取建议..."}
                                      value={item.admissionAdvice || ''}
                                      onChange={(e) => handleUpdateFinalSchool(item.id, 'admissionAdvice', e.target.value)}
                                   />
                                </td>

                                {/* Deadlines */}
                                <td className="px-6 py-4 align-top relative">
                                   <textarea 
                                      className={`w-full bg-transparent border border-gray-200 rounded p-2 text-xs text-gray-600 focus:border-primary-500 outline-none resize-none h-24 focus:bg-white transition-all font-mono ${isBatchEnriching && !item.deadlines ? 'animate-pulse bg-gray-50' : ''}`}
                                      placeholder="ED: MM-DD&#10;RD: MM-DD"
                                      value={item.deadlines}
                                      onChange={(e) => handleUpdateFinalSchool(item.id, 'deadlines', e.target.value)}
                                   />
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 align-top">
                                   <div className="flex flex-col gap-2">
                                      <button 
                                         onClick={() => handleEnrichSchoolInfo(item.id)}
                                         disabled={enrichingSchoolId === item.id || isBatchEnriching}
                                         className="flex items-center justify-center gap-1 w-full py-1.5 bg-primary-50 text-primary-700 rounded text-xs font-bold hover:bg-primary-100 transition-colors disabled:opacity-70"
                                      >
                                         {enrichingSchoolId === item.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                                         {enrichingSchoolId === item.id ? (isEn ? 'Searching...' : '搜索中...') : (isEn ? 'AI Smart Enrich' : 'AI 智能补全')}
                                      </button>
                                      
                                      {item.portalLink ? (
                                         <a 
                                            href={item.portalLink} target="_blank" rel="noreferrer"
                                            className="flex items-center justify-center gap-1 w-full py-1.5 bg-white border border-gray-200 text-gray-600 rounded text-xs hover:text-primary-600 hover:border-primary-200 transition-colors"
                                         >
                                            <ExternalLink className="w-3 h-3" /> {isEn ? 'Apply Portal' : '申请入口'}
                                         </a>
                                      ) : (
                                         <button className="flex items-center justify-center gap-1 w-full py-1.5 bg-white border border-gray-200 text-gray-400 rounded text-xs cursor-not-allowed">
                                            <LinkIcon className="w-3 h-3" /> {isEn ? 'No Link' : '暂无链接'}
                                         </button>
                                      )}
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           ))
        )}
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100 mt-auto">
        <button 
          onClick={onNext}
          disabled={selectedSchools.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold shadow-md hover:bg-black hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEn ? 'Next: Gap Analysis (Step 5)' : '下一步：差距分析 (Step 5)'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step4FinalList;

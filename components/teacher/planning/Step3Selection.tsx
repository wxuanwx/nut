
import React from 'react';
import { Target, Sliders, RotateCcw, Lightbulb, Sparkles, Search, Loader2, RefreshCw, AlertTriangle, CheckCircle, School, X, BookOpen, Plus } from '../../common/Icons';
import { TargetPreference, UniversityDisplay, SelectedSchool } from './PlanningData';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Step3Props {
  targetPreferences: TargetPreference[];
  simParams: { gpa: number; toefl: number; sat: number };
  setSimParams: (val: { gpa: number; toefl: number; sat: number }) => void;
  schoolSearchQuery: string;
  setSchoolSearchQuery: (val: string) => void;
  selectedSchools: SelectedSchool[];
  handleAddSchool: (uni: UniversityDisplay, tier: 'Reach' | 'Match' | 'Safety', specificMajor?: string) => void;
  handleRemoveSchool: (id: string) => void;
  step3Tab: 'Recommend' | 'Search';
  setStep3Tab: (val: 'Recommend' | 'Search') => void;
  isRegenerating: boolean;
  handleRegenerateRecommendations: () => void;
  recommendedUniversities: UniversityDisplay[];
  getListHealth: () => { status: string; color: string; text: string };
  onNext: () => void;
}

const Step3Selection: React.FC<Step3Props> = ({
  targetPreferences, simParams, setSimParams,
  schoolSearchQuery, setSchoolSearchQuery,
  selectedSchools, handleAddSchool, handleRemoveSchool,
  step3Tab, setStep3Tab, isRegenerating, handleRegenerateRecommendations,
  recommendedUniversities, getListHealth, onNext
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  return (
    <div className="flex h-full gap-6">
      {/* Left Column: Context & Simulator */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-6">
         {/* Target Context */}
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
               <Target className="w-3 h-3" /> {isEn ? 'Step 2 Targets' : 'Step 2 目标设定'}
            </h4>
            {targetPreferences.length > 0 ? (
               <div className="space-y-2">
                  {targetPreferences.map((t) => (
                     <div key={t.id} className="text-sm border-l-2 border-primary-300 pl-2">
                        <div className="font-bold text-gray-800">{t.region === 'US' ? (isEn ? '🇺🇸 US' : '🇺🇸 美国') : t.region === 'UK' ? (isEn ? '🇬🇧 UK' : '🇬🇧 英国') : t.region}</div>
                        <div className="text-xs text-gray-500 truncate">{t.majors.join(', ') || (isEn ? 'Undecided' : '未定专业')}</div>
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-xs text-red-400 bg-red-50 p-2 rounded">{isEn ? 'Please set targets in Step 2 first' : '请先完成 Step 2 设定目标'}</p>
            )}
         </div>

         {/* Capability Simulator */}
         <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <Sliders className="w-4 h-4 text-primary-600" /> {isEn ? 'Capability Simulator' : '能力模拟器'}
               </h3>
               <button 
                  className="text-xs text-gray-400 hover:text-primary-600" 
                  onClick={() => setSimParams({gpa: 3.85, toefl: 102, sat: 1450})}
                  title={isEn ? "Reset" : "重置"}
               >
                  <RotateCcw className="w-3 h-3"/>
               </button>
            </div>
            
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-xs mb-1.5">
                     <span className="text-gray-500 font-medium">GPA (Weighted)</span>
                     <span className="font-bold text-primary-700">{simParams.gpa}</span>
                  </div>
                  <input 
                     type="range" min="3.0" max="4.5" step="0.05"
                     className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                     value={simParams.gpa}
                     onChange={(e) => setSimParams({...simParams, gpa: parseFloat(e.target.value)})}
                  />
               </div>
               <div>
                  <div className="flex justify-between text-xs mb-1.5">
                     <span className="text-gray-500 font-medium">TOEFL</span>
                     <span className={`font-bold ${simParams.toefl < 100 ? 'text-orange-600' : 'text-primary-700'}`}>{simParams.toefl}</span>
                  </div>
                  <input 
                     type="range" min="80" max="120" step="1"
                     className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                     value={simParams.toefl}
                     onChange={(e) => setSimParams({...simParams, toefl: parseInt(e.target.value)})}
                  />
               </div>
               <div>
                  <div className="flex justify-between text-xs mb-1.5">
                     <span className="text-gray-500 font-medium">SAT</span>
                     <span className="font-bold text-primary-700">{simParams.sat}</span>
                  </div>
                  <input 
                     type="range" min="1000" max="1600" step="10"
                     className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                     value={simParams.sat}
                     onChange={(e) => setSimParams({...simParams, sat: parseInt(e.target.value)})}
                  />
               </div>
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 leading-relaxed border border-gray-100">
               <Lightbulb className="w-3 h-3 text-yellow-500 inline mr-1" />
               {isEn ? 'Adjust sliders to simulate admission probabilities and refresh recommendations.' : '调整滑条可实时模拟不同成绩组合下的录取概率与推荐列表变化。'}
            </div>
         </div>
      </div>

      {/* Middle Column: Discovery */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-[#e5e0dc] overflow-hidden">
         <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex gap-2">
               <div className="flex bg-gray-200 p-1 rounded-lg">
                  <button 
                     onClick={() => setStep3Tab('Recommend')}
                     className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1
                        ${step3Tab === 'Recommend' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}
                     `}
                  >
                     <Sparkles className="w-3 h-3" /> {isEn ? 'AI Recommend' : '智能推荐'}
                  </button>
                  <button 
                     onClick={() => setStep3Tab('Search')}
                     className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1
                        ${step3Tab === 'Search' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}
                     `}
                  >
                     <Search className="w-3 h-3" /> {isEn ? 'Manual Search' : '自主选校'}
                  </button>
               </div>
               
               {step3Tab === 'Recommend' && (
                  <button 
                    onClick={handleRegenerateRecommendations}
                    disabled={isRegenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary-200 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-50 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isRegenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
                    {isRegenerating ? (isEn ? 'Refreshing...' : '刷新中...') : (isEn ? 'Refresh Recommendations' : '根据目标刷新推荐')}
                  </button>
               )}
            </div>

            {step3Tab === 'Search' && (
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder={isEn ? "Search school..." : "搜索大学名称..."}
                     className="pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs w-40 focus:border-primary-400 outline-none"
                     value={schoolSearchQuery}
                     onChange={(e) => setSchoolSearchQuery(e.target.value)}
                  />
                  <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
               </div>
            )}
         </div>

         <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
            {simParams.toefl < 100 && (
               <div className="mb-3 bg-orange-50 border border-orange-100 rounded-lg p-2.5 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-700 font-medium">
                     {isEn ? 'Language Risk: Current TOEFL is below Top 30 threshold.' : '语言风险预警：当前 TOEFL 低于部分 Top 30 院校门槛。'}
                  </span>
               </div>
            )}

            <div className="space-y-3">
               {recommendedUniversities.map(uni => {
                  const isSelected = selectedSchools.some(s => s.uni.id === uni.id);
                  // Find matching majors based on region
                  const matchingTarget = targetPreferences.find(t => t.region === uni.region);
                  const targetMajors = matchingTarget?.majors || [];

                  return (
                     <div key={uni.id} className={`bg-white border rounded-xl p-3 shadow-sm transition-all group relative
                        ${isSelected ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300 hover:shadow-md'}
                     `}>
                        <div className="flex justify-between items-start">
                           <div className="flex gap-3">
                              <img src={uni.logo} className="w-10 h-10 rounded object-contain bg-white border border-gray-100 p-0.5" alt={uni.name} />
                              <div>
                                 <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900 text-sm">{uni.name}</h4>
                                    <span className="text-xs text-gray-500">#{uni.rank}</span>
                                 </div>
                                 
                                 {/* Display Target Majors with individual add buttons if majors exist */}
                                 {targetMajors.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                       <div className="flex items-center gap-1.5 text-xs text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-100/50 bg-indigo-50/30 w-fit mb-1">
                                          <Target className="w-3 h-3 text-indigo-600" />
                                          <span className="font-bold text-indigo-700">{isEn ? 'Major Match:' : '专业匹配:'}</span>
                                       </div>
                                       {targetMajors.map(major => {
                                          const isMajorSelected = selectedSchools.some(s => s.uni.id === uni.id && s.major === major);
                                          return (
                                             <div key={major} className="flex justify-between items-center bg-gray-50/80 border border-gray-100 px-2 py-1.5 rounded text-xs hover:bg-white hover:shadow-sm transition-all group/major">
                                                <span className="font-medium text-gray-700 truncate max-w-[120px] pr-2" title={major}>{major}</span>
                                                
                                                {!isMajorSelected ? (
                                                   <div className="flex gap-1 opacity-60 group-hover/major:opacity-100 transition-opacity">
                                                      <button onClick={() => handleAddSchool(uni, 'Reach', major)} className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 hover:border-red-300">+R</button>
                                                      <button onClick={() => handleAddSchool(uni, 'Match', major)} className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-blue-600 border border-blue-200 rounded hover:bg-blue-50 hover:border-blue-300">+M</button>
                                                      <button onClick={() => handleAddSchool(uni, 'Safety', major)} className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-green-600 border border-green-200 rounded hover:bg-green-50 hover:border-green-300">+S</button>
                                                   </div>
                                                ) : (
                                                   <span className="text-[10px] text-green-600 flex items-center gap-1 font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                      <CheckCircle className="w-3 h-3" /> Added
                                                   </span>
                                                )}
                                             </div>
                                          )
                                       })}
                                    </div>
                                 )}

                                 {/* School Tags */}
                                 <div className="flex flex-wrap gap-1 mt-2">
                                    {uni.tags.map(t => <span key={t} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{t}</span>)}
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className={`text-lg font-bold ${uni.matchScore! >= 80 ? 'text-green-600' : uni.matchScore! >= 60 ? 'text-primary-600' : 'text-red-500'}`}>
                                 {uni.matchScore}
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                                 ${uni.winRate === 'High' ? 'bg-green-100 text-green-700' : uni.winRate === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-red-50 text-red-700 border border-red-100'}
                              `}>
                                 Win: {uni.winRate}
                              </span>
                           </div>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-100 text-xs text-gray-500 leading-snug">
                           <span className="font-bold text-gray-400">{isEn ? 'AI Analysis: ' : 'AI 分析：'}</span>{uni.reason}
                        </div>

                        {/* Standard Add Buttons (Only if no specific majors defined) */}
                        {targetMajors.length === 0 && !isSelected && (
                           <div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleAddSchool(uni, 'Reach')} className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100">+ Reach</button>
                              <button onClick={() => handleAddSchool(uni, 'Match')} className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100">+ Match</button>
                              <button onClick={() => handleAddSchool(uni, 'Safety')} className="px-2 py-1 text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100">+ Safety</button>
                           </div>
                        )}
                        
                        {/* Generic "Added" badge for schools without specific major tracking in UI */}
                        {targetMajors.length === 0 && isSelected && (
                           <div className="absolute top-2 right-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                           </div>
                        )}
                     </div>
                  )
               })}
               {recommendedUniversities.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-xs">
                     {step3Tab === 'Recommend' ? (
                        <>
                           <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
                           <p>{isEn ? 'Click refresh to generate' : '点击上方刷新按钮生成推荐'}</p>
                        </>
                     ) : (
                        <p>{isEn ? 'No results found' : '没有找到符合条件的学校'}</p>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Right Column: List & Health */}
      <div className="w-72 flex-shrink-0 bg-white rounded-xl shadow-sm border border-[#e5e0dc] flex flex-col">
         <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
               <School className="w-4 h-4 text-primary-600" /> {isEn ? 'Selected List' : '定校清单'} ({selectedSchools.length})
            </h3>
            {/* Health Monitor */}
            <div className="mt-3 bg-white border border-gray-200 rounded-lg p-2">
               <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="font-bold text-gray-500">{isEn ? 'STRUCTURE HEALTH' : 'STRUCTURE HEALTH'}</span>
                  <span className={`font-bold ${getListHealth().color}`}>{getListHealth().status}</span>
               </div>
               <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className="bg-red-400 h-full" style={{width: `${(selectedSchools.filter(s=>s.tier==='Reach').length / Math.max(selectedSchools.length, 1))*100}%`}}></div>
                  <div className="bg-blue-400 h-full" style={{width: `${(selectedSchools.filter(s=>s.tier==='Match').length / Math.max(selectedSchools.length, 1))*100}%`}}></div>
                  <div className="bg-green-400 h-full" style={{width: `${(selectedSchools.filter(s=>s.tier==='Safety').length / Math.max(selectedSchools.length, 1))*100}%`}}></div>
               </div>
               <p className="text-[10px] text-gray-400">{getListHealth().text}</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {['Reach', 'Match', 'Safety'].map(tier => {
               const schools = selectedSchools.filter(s => s.tier === tier);
               const bg = tier === 'Reach' ? 'bg-red-50 text-red-700 border-red-100' : tier === 'Match' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100';
               
               return (
                  <div key={tier}>
                     <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border uppercase ${bg}`}>{tier}</span>
                        <span className="text-[10px] text-gray-400">{schools.length}</span>
                     </div>
                     <div className="space-y-1.5 min-h-[30px] p-1 rounded-lg border border-dashed border-gray-100 bg-gray-50/50">
                        {schools.map(s => (
                           <div key={s.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 shadow-sm group">
                              <div className="flex flex-col overflow-hidden w-full">
                                 <div className="flex items-center gap-2">
                                    <img src={s.uni.logo} className="w-4 h-4 object-contain" alt="" />
                                    <span className="text-xs font-medium text-gray-700 truncate">{s.uni.name}</span>
                                 </div>
                                 {s.major && (
                                    <div className="flex items-center justify-between pl-6 mt-0.5">
                                       <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{s.major}</span>
                                    </div>
                                 )}
                              </div>
                              <button onClick={() => handleRemoveSchool(s.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                        {schools.length === 0 && <p className="text-[10px] text-gray-300 text-center py-1">{isEn ? 'Drag or add here' : 'Drag or add here'}</p>}
                     </div>
                  </div>
               )
            })}
         </div>

         <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <button 
               onClick={onNext}
               disabled={selectedSchools.length === 0}
               className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
               <CheckCircle className="w-3 h-3" /> {isEn ? 'Confirm & Proceed' : '确认定校并推送 (Confirm)'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default Step3Selection;

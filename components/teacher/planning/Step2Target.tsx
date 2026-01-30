
import React from 'react';
import { Brain, Plus, Sparkles, Target, MapPin, X, Lightbulb, ChevronRight } from '../../common/Icons';
import { CareerResult, TargetPreference, COMMON_MAJORS } from './PlanningData';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Step2Props {
  careerResult: CareerResult | null;
  targetPreferences: TargetPreference[];
  setTargetPreferences: React.Dispatch<React.SetStateAction<TargetPreference[]>>;
  targetInputValues: { [key: number]: string };
  setTargetInputValues: (val: { [key: number]: string }) => void;
  activeRecommendMenu: number | null;
  setActiveRecommendMenu: (val: number | null) => void;
  onNext: () => void;
  handleAddMajorToTarget: (targetId: number, major: string) => void;
}

const Step2Target: React.FC<Step2Props> = ({
  careerResult, targetPreferences, setTargetPreferences, 
  targetInputValues, setTargetInputValues, 
  activeRecommendMenu, setActiveRecommendMenu, 
  onNext, handleAddMajorToTarget
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const handleRemoveTarget = (id: number) => {
    setTargetPreferences(targetPreferences.filter(t => t.id !== id));
  };

  const handleUpdateRegion = (id: number, value: string) => {
    setTargetPreferences(targetPreferences.map(t => t.id === id ? { ...t, region: value } : t));
  };

  const handleAddTarget = () => {
    if (targetPreferences.length < 3) {
      setTargetPreferences([...targetPreferences, { id: Date.now(), region: 'US', majors: [] }]);
    }
  };

  const handleRemoveMajorFromTarget = (targetId: number, majorToRemove: string) => {
    setTargetPreferences(prev => prev.map(t => 
      t.id === targetId ? { ...t, majors: t.majors.filter(m => m !== majorToRemove) } : t
    ));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, targetId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = targetInputValues[targetId]?.trim();
      if (val) {
        handleAddMajorToTarget(targetId, val);
        setTargetInputValues({ ...targetInputValues, [targetId]: '' });
      }
    }
  };

  // Helper to format common majors based on language
  const formatMajor = (major: string) => {
      if (isEn) {
          return major.split(' (')[0];
      }
      const parts = major.split(' (');
      if (parts.length > 1) {
          return parts[1].replace(')', '');
      }
      return major;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Column: AI Recommendations */}
      <div className="w-full md:w-1/3 space-y-6">
         <div className="bg-gradient-to-br from-primary-50 to-white p-5 rounded-xl border border-primary-100">
            <h3 className="font-bold text-primary-900 mb-2 flex items-center gap-2 text-sm">
               <Brain className="w-4 h-4" /> {isEn ? 'AI Recommended Majors (Step 1)' : 'AI 推荐专业 (Step 1)'}
            </h3>
            {careerResult?.majors ? (
               <div className="space-y-2 mt-4 relative">
                  {careerResult.majors.map((major, idx) => (
                     <div 
                        key={idx} 
                        className={`bg-white p-3 rounded-lg border border-primary-100 shadow-sm transition-all group relative ${activeRecommendMenu === idx ? 'z-30 ring-2 ring-primary-100' : ''}`}
                     >
                        <div className="flex justify-between items-start">
                           <span className="text-xs font-bold text-gray-800 leading-snug">{major.name}</span>
                           <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                              {major.match}%
                           </span>
                        </div>
                        
                        <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (targetPreferences.length === 1) {
                                handleAddMajorToTarget(targetPreferences[0].id, major.name);
                              } else if (targetPreferences.length > 1) {
                                setActiveRecommendMenu(activeRecommendMenu === idx ? null : idx);
                              }
                            }}
                            className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-primary-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          
                          {activeRecommendMenu === idx && targetPreferences.length > 1 && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 font-bold uppercase">
                                {isEn ? 'Add to which target?' : '添加至哪个目标?'}
                              </div>
                              {targetPreferences.map((target, tIdx) => (
                                <button
                                  key={target.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddMajorToTarget(target.id, major.name);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center justify-between"
                                >
                                  <span>{target.region}</span>
                                  <ChevronRight className="w-3 h-3 opacity-50" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">{isEn ? 'Complete Step 1 to get recommendations' : '请先完成 Step 1 以获取智能推荐'}</p>
               </div>
            )}
         </div>

         <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
               <Lightbulb className="w-4 h-4 text-yellow-500" /> {isEn ? 'Popular Majors' : '常见热门专业'}
            </h3>
            <div className="flex flex-wrap gap-2">
               {COMMON_MAJORS.map((major, idx) => (
                  <button 
                     key={idx}
                     onClick={() => {
                        if (targetPreferences.length > 0) {
                           handleAddMajorToTarget(targetPreferences[0].id, major.split(' (')[0]);
                        }
                     }}
                     className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                     {formatMajor(major)}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Right Column: User Preferences */}
      <div className="flex-1 space-y-6">
         <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
               <Target className="w-5 h-5 text-primary-600" /> {isEn ? 'Target Preferences' : '申请目标意向 (Target Preferences)'}
            </h3>
            <button 
               onClick={handleAddTarget}
               disabled={targetPreferences.length >= 3}
               className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
               <Plus className="w-3 h-3" /> {isEn ? 'Add Country/Region' : '添加申请国别'}
            </button>
         </div>

         <div className="space-y-4">
            {targetPreferences.map((target, index) => (
               <div key={target.id} className="bg-white p-5 rounded-xl border border-[#e5e0dc] shadow-sm relative group transition-all hover:shadow-md">
                  {targetPreferences.length > 1 && (
                     <button 
                        onClick={() => handleRemoveTarget(target.id)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  )}

                  <div className="mb-4">
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{isEn ? 'Country/Region' : '申请国家/地区'}</label>
                     <div className="flex gap-2">
                        {['US', 'UK', 'HK', 'SG', 'Canada', 'Australia'].map(r => (
                           <button
                              key={r}
                              onClick={() => handleUpdateRegion(target.id, r)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                                 ${target.region === r ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                              `}
                           >
                              {r === 'US' ? '🇺🇸 US' : r === 'UK' ? '🇬🇧 UK' : r === 'HK' ? '🇭🇰 HK' : r === 'SG' ? '🇸🇬 SG' : r}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{isEn ? 'Intended Majors' : '意向专业 (Majors)'}</label>
                     <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-lg min-h-[42px] border border-gray-100">
                        {target.majors.map(m => (
                           <span key={m} className="bg-white text-primary-700 px-2 py-1 rounded text-xs font-medium border border-primary-100 flex items-center gap-1 shadow-sm">
                              {m}
                              <button onClick={() => handleRemoveMajorFromTarget(target.id, m)} className="hover:text-red-500"><X className="w-3 h-3"/></button>
                           </span>
                        ))}
                        <input 
                           className="bg-transparent text-xs outline-none flex-1 min-w-[120px] placeholder:text-gray-400"
                           placeholder={isEn ? "Type major & hit enter..." : "输入专业按回车添加..."}
                           value={targetInputValues[target.id] || ''}
                           onChange={(e) => setTargetInputValues({...targetInputValues, [target.id]: e.target.value})}
                           onKeyDown={(e) => handleInputKeyDown(e, target.id)}
                        />
                     </div>
                     <p className="text-[10px] text-gray-400">{isEn ? 'Tip: You can add directly from the AI recommendations on the left.' : '提示：可从左侧 AI 推荐列表中直接添加。'}</p>
                  </div>
               </div>
            ))}
         </div>

         <div className="flex justify-end pt-4">
            <button 
               onClick={onNext}
               disabled={targetPreferences.some(t => t.majors.length === 0)}
               className="px-8 py-3 bg-primary-600 text-white rounded-full font-bold shadow-lg hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isEn ? 'Next: Smart Selection (Step 3)' : '下一步：智能定校 (Step 3)'} <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default Step2Target;

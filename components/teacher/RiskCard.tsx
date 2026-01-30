
import React from 'react';
import { AlertTriangle, TrendingUp, FileText, Clock, MessageSquare } from '../common/Icons';
import { RiskCategory } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface RiskCardProps {
  onRiskClick?: (riskType: string) => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ onRiskClick }) => {
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  const risks: RiskCategory[] = [
    { type: isEn ? 'Academic' : '成绩风险', count: 3, severity: 'high', details: isEn ? 'GPA Drop/Fail' : 'GPA波动/挂科' },
    { type: isEn ? 'Target' : '目标风险', count: 2, severity: 'high', details: isEn ? 'Target Mismatch' : '目标偏离/过高' },
    { type: isEn ? 'Task' : '任务风险', count: 8, severity: 'medium', details: isEn ? 'Deadline/Overdue' : '节点临近/逾期' },
    { type: isEn ? 'Material' : '材料风险', count: 5, severity: 'medium', details: isEn ? 'Missing Items' : '缺失/证据不足' },
    { type: isEn ? 'Comm' : '沟通风险', count: 4, severity: 'low', details: isEn ? 'No Response' : '长期未确认' },
  ];

  const getIcon = (type: string) => {
    if (type.includes('成绩') || type === 'Academic') return <TrendingUp className="w-4 h-4" />;
    if (type.includes('材料') || type === 'Material') return <FileText className="w-4 h-4" />;
    if (type.includes('任务') || type === 'Task') return <Clock className="w-4 h-4" />;
    if (type.includes('沟通') || type === 'Comm') return <MessageSquare className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 px-6 py-5 rounded-2xl shadow-sm border border-[#e5e0dc] dark:border-white/5 transition-all">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          {isEn ? 'Risk Radar' : '风险雷达'}
        </h3>
        <span className="text-[10px] bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-black border border-red-100 dark:border-red-500/20">
          {isEn ? '22 Alerts' : '需关注 22 人次'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {risks.map((risk, idx) => (
          <div 
            key={idx} 
            onClick={() => onRiskClick && onRiskClick(risk.type)}
            className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-500/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`p-1.5 rounded-lg ${
                risk.severity === 'high' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                  : risk.severity === 'medium' 
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' 
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
              }`}>
                {getIcon(risk.type)}
              </div>
              <span className={`text-xl font-black ${
                risk.severity === 'high' 
                  ? 'text-red-700 dark:text-red-400' 
                  : 'text-gray-900 dark:text-zinc-100'
              }`}>{risk.count}</span>
            </div>
            <div className="w-full">
              <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">{risk.type}</p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 truncate group-hover:text-primary-600 transition-colors">
                {risk.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskCard;

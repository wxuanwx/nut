
import React, { useState } from 'react';
import { 
  Plus, CheckCircle, XCircle, Clock, Edit, Trash2
} from '../common/Icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface OfferRecord {
  id: string;
  school: string;
  major: string;
  round: string;
  result: 'Pending' | 'Admitted' | 'Rejected' | 'Deferred' | 'Waitlisted';
  date: string;
}

const initialOffers: OfferRecord[] = [
    { id: 'o1', school: 'Carnegie Mellon Univ', major: 'CS', round: 'ED1', result: 'Pending', date: '-' },
    { id: 'o2', school: 'UIUC', major: 'CS', round: 'EA', result: 'Admitted', date: '2024-12-15' },
    { id: 'o3', school: 'Georgia Tech', major: 'CS', round: 'EA', result: 'Deferred', date: '2024-12-10' },
];

const StudentOfferTracking: React.FC = () => {
  const [offers, setOffers] = useState<OfferRecord[]>(initialOffers);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const { language } = useLanguage();
  const isEn = language === 'en-US';

  return (
     <div className="animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-gray-800 text-lg">{isEn ? 'Application & Offer Tracking' : '申请与录取追踪'}</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e0dc] overflow-hidden">
           <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-4">{isEn ? 'School' : '学校'}</th>
                    <th className="px-6 py-4">{isEn ? 'Major' : '专业'}</th>
                    <th className="px-6 py-4">{isEn ? 'Round' : '申请轮次'}</th>
                    <th className="px-6 py-4">{isEn ? 'Result' : '录取结果'}</th>
                    <th className="px-6 py-4">{isEn ? 'Date' : '通知日期'}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {offers.map(offer => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 font-bold text-gray-800">{offer.school}</td>
                       <td className="px-6 py-4 text-gray-600">{offer.major}</td>
                       <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{offer.round}</span>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border
                             ${offer.result === 'Admitted' ? 'bg-green-50 text-green-700 border-green-100' :
                               offer.result === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                               offer.result === 'Pending' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                               'bg-orange-50 text-orange-700 border-orange-100'}
                          `}>
                             {offer.result === 'Admitted' && <CheckCircle className="w-3 h-3" />}
                             {offer.result === 'Rejected' && <XCircle className="w-3 h-3" />}
                             {offer.result === 'Pending' && <Clock className="w-3 h-3" />}
                             {offer.result}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-gray-500 font-mono text-xs">{offer.date}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
        
        {isAddingOffer && (
           <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-between animate-in fade-in">
              <span className="text-sm text-gray-500 italic">{isEn ? 'New Record Form (Mock)...' : '新建记录表单 (Mock)...'}</span>
              <div className="flex gap-2">
                 <button onClick={() => setIsAddingOffer(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">{isEn ? 'Cancel' : '取消'}</button>
                 <button onClick={() => setIsAddingOffer(false)} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded font-bold">{isEn ? 'Save' : '保存'}</button>
              </div>
           </div>
        )}
     </div>
  );
};

export default StudentOfferTracking;

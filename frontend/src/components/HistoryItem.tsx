import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

interface PredictionResult {
  recurrence_risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendation: string;
  detailed_advice: string;
}

interface HistoryItemData extends PredictionResult {
  id: string;
  date: string;
  previewUrl: string;
}

interface HistoryItemProps {
  item: HistoryItemData;
  onClick: (item: HistoryItemData) => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Low': return 'bg-green-100 text-green-700 border-green-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'High': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100';
  }
};

export const HistoryCard: React.FC<HistoryItemProps> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="glass-card p-4 flex gap-6 items-center hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
    >
      <div className="relative">
        <img
          src={item.previewUrl}
          alt="History"
          className="w-24 h-24 object-cover rounded-lg shadow-sm bg-black group-hover:shadow-md transition-shadow"
        />
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 rounded-lg transition-colors flex items-center justify-center">
           <ChevronRight className="text-white opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" size={24} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskColor(item.recurrence_risk)}`}>
            {item.recurrence_risk} Risk
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={12} /> {item.date}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-600 line-clamp-2 mb-2">
          {item.recommendation}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Confidence</span>
          <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${item.recurrence_risk === 'High' ? 'bg-red-500' : item.recurrence_risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${item.confidence * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            {(item.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

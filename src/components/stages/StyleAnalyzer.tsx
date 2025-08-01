'use client';

import { Wand2, ChevronsUpDown, Loader } from 'lucide-react';
import { useState } from 'react';

// 이것은 임시 부품이며, 추후에 전체 기능을 복원해야 합니다.
const StyleAnalyzer = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-sm font-bold text-white flex items-center"><Wand2 size={16} className="mr-2 text-blue-400"/> 나만의 글쓰기 스타일</h3>
                <ChevronsUpDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="mt-3">
                    <p className="text-xs text-gray-400">기능 복원 예정입니다.</p>
                </div>
            )}
        </div>
    );
};

export default StyleAnalyzer;
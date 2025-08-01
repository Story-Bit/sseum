'use client';

import React, { useState } from 'react';
import { useBlogStore } from './blog-store';
import { ImageIcon, Link, Share2, Film, FileText } from 'lucide-react';

const Stage3_Publish = () => {
    const { activePost } = useBlogStore();
    const [activeTab, setActiveTab] = useState('imageStudio');

    const tabs = [
        { id: 'imageStudio', name: '이미지 스튜디오', icon: <ImageIcon/> },
        { id: 'internalLinks', name: '내부 링크 전략', icon: <Link /> },
        { id: 'social', name: '소셜 미디어', icon: <Share2/> },
        { id: 'video', name: '영상 변환', icon: <Film/> },
        { id: 'dataFinder', name: '데이터 자료', icon: <FileText/> }
    ];

    if (!activePost) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">분석할 포스트가 선택되지 않았습니다.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">발행 및 콘텐츠 활용</h2>
            <p className="text-gray-600 mb-6">완성된 글을 다양한 포맷으로 변환하고, 발행을 위한 최종 준비를 하세요.</p>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            {React.cloneElement(tab.icon, { className: 'w-5 h-5 mr-2' })} {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-6">
                {/* Each tab's content component will be rendered here */}
                <p>현재 선택된 탭: {activeTab}</p>
            </div>
        </div>
    );
};

export default Stage3_Publish;
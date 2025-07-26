'use client';

import React, { useState } from 'react';
import { useBlog } from '@/components/BlogContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Award, Mic, Loader } from 'lucide-react';
import SeoPanel from './panels/SeoPanel';

const PanelTab: React.FC<{
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ isActive, onClick, icon, label }) => (
    <button 
      onClick={onClick} 
      className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
        isActive 
          ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon} {label}
    </button>
);

const Stage2_Refinement = () => {
  const { activePost, setActivePost, setPosts, isGeneratingDraft } = useBlog();
  const [activePanel, setActivePanel] = useState<'seo' | 'critic' | 'expert'>('seo');

  if (isGeneratingDraft) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 font-semibold text-gray-600">AI가 초고를 작성하고 있습니다...</p>
          <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (!activePost) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">퇴고할 포스트가 선택되지 않았습니다. 사이드바에서 글을 선택해주세요.</p>
      </div>
    );
  }

  const handleUpdate = (data: Partial<typeof activePost>) => {
    const updatedPost = { ...activePost, ...data };
    setActivePost(updatedPost);
    // 실시간으로 posts 배열도 업데이트하여 사이드바와 동기화
    setPosts(prev => prev.map(p => p.id === activePost.id ? updatedPost : p));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full animate-fade-in">
      <div className="xl:col-span-2 bg-white rounded-xl shadow-lg flex flex-col h-[calc(100vh-10rem)]">
        <div className="p-3 border-b flex-shrink-0">
          <Input
            type="text"
            value={activePost.title || ''}
            onChange={e => handleUpdate({ title: e.target.value })}
            className="w-full p-2 text-xl font-bold border-none focus:outline-none shadow-none focus-visible:ring-0"
            placeholder="매력적인 제목을 입력하세요"
          />
        </div>
        <Textarea
          value={activePost.draft || ''}
          onChange={e => handleUpdate({ draft: e.target.value })}
          className="w-full flex-grow p-5 resize-none focus:outline-none leading-relaxed text-gray-800 border-none shadow-none focus-visible:ring-0"
          placeholder="여기에 초고를 작성하거나 붙여넣으세요."
        />
        <div className="p-3 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
          <p className="text-xs text-gray-500">글자 수: {(activePost.draft || '').length.toLocaleString()}자</p>
        </div>
      </div>

      <div className="xl:col-span-1 bg-white rounded-xl shadow-lg flex flex-col h-[calc(100vh-10rem)]">
        <div className="flex border-b">
          <PanelTab isActive={activePanel === 'seo'} onClick={() => setActivePanel('seo')} icon={<Search size={16} />} label="AI SEO 코치" />
          <PanelTab isActive={activePanel === 'critic'} onClick={() => setActivePanel('critic')} icon={<Award size={16} />} label="AI 평론가" />
          <PanelTab isActive={activePanel === 'expert'} onClick={() => setActivePanel('expert')} icon={<Mic size={16} />} label="편집장 요청" />
        </div>
        
        {activePanel === 'seo' && <SeoPanel />}
        {activePanel === 'critic' && <div className="flex-grow p-4">AI 평론가 기능 (제작 예정)</div>}
        {activePanel === 'expert' && <div className="flex-grow p-4">편집장 요청 기능 (제작 예정)</div>}
      </div>
    </div>
  );
};

export default Stage2_Refinement;
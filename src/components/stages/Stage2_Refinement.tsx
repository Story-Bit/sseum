// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

import React, { useState } from 'react';
import { useBlogStore, PostType } from './blog-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Award, Mic, Loader } from 'lucide-react';
// 당신의 설계도에 있는 실제 경로로 수정했습니다.
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
          ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600 dark:bg-gray-800 dark:text-white' 
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon} {label}
    </button>
);

const Stage2_Refinement = () => {
  const { activePost, setActivePost, upsertPostInList, isLoading, loadingMessage } = useBlogStore();
  const [activePanel, setActivePanel] = useState<'seo' | 'critic' | 'expert'>('seo');

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 font-semibold text-gray-600">{loadingMessage}</p>
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

  const handleUpdate = (data: Partial<PostType>) => {
    if (!activePost) return;
    const updatedPost = { ...activePost, ...data };
    setActivePost(updatedPost);
    upsertPostInList(updatedPost);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full animate-fade-in p-4">
      <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-3 border-b flex-shrink-0">
          <Input
            type="text"
            value={activePost.title || ''}
            onChange={e => handleUpdate({ title: e.target.value })}
            className="w-full p-2 text-xl font-bold border-none focus:outline-none shadow-none focus-visible:ring-0 bg-transparent"
            placeholder="매력적인 제목을 입력하세요"
          />
        </div>
        <Textarea
          value={activePost.draft || ''}
          onChange={e => handleUpdate({ draft: e.target.value })}
          className="w-full flex-grow p-5 resize-none focus:outline-none leading-relaxed text-gray-800 dark:text-gray-200 border-none shadow-none focus-visible:ring-0 bg-transparent"
          placeholder="여기에 초고를 작성하거나 붙여넣으세요."
        />
        <div className="p-3 border-t bg-gray-50 dark:bg-gray-800 rounded-b-xl flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">글자 수: {(activePost.draft || '').length.toLocaleString()}자</p>
        </div>
      </div>

      <div className="xl:col-span-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex border-b">
          <PanelTab isActive={activePanel === 'seo'} onClick={() => setActivePanel('seo')} icon={<Search size={16} />} label="AI SEO 코치" />
          <PanelTab isActive={activePanel === 'critic'} onClick={() => setActivePanel('critic')} icon={<Award size={16} />} label="AI 평론가" />
          <PanelTab isActive={activePanel === 'expert'} onClick={() => setActivePanel('expert')} icon={<Mic size={16} />} label="편집장 요청" />
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {activePanel === 'seo' && <SeoPanel />}
          {activePanel === 'critic' && <div className="p-4">AI 평론가 기능 (제작 예정)</div>}
          {activePanel === 'expert' && <div className="p-4">편집장 요청 기능 (제작 예정)</div>}
        </div>
      </div>
    </div>
  );
};

export default Stage2_Refinement;
'use client';

import React, { type ReactElement, useState } from 'react';
import { useBlogStore, type Stage } from './stages/blog-store';
import { useModalStore } from './stages/modal-store';
import { useAuth } from './AuthContext';
import { savePostToFirestore } from '@/firebase/post';
import { toast } from 'sonner';
import { FilePlus, UploadCloud, Save, FolderOpen, Search, Brain, Share2, Sparkles, Wand2, ChevronsUpDown } from 'lucide-react';

// 'ActionButton'의 잘못된 부분을 수정합니다.
const ActionButton: React.FC<{ onClick: () => void; disabled?: boolean; icon: React.ReactNode; text: string; }> = ({ onClick, disabled, icon, text }) => (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center justify-center p-2 text-center rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {icon} 
        {/* 'whitespace-now"p' 에서 잘못된 'p'를 제거했습니다. */}
        <span className="text-xs mt-1.5 whitespace-nowrap">{text}</span>
    </button>
);

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

interface SidebarProps {
  isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
  const { user } = useAuth();
  const { activePost, setActivePost, upsertPostInList, currentStage, setCurrentStage } = useBlogStore();
  const { openModal } = useModalStore();

  const handleNewPost = () => {
    setActivePost({ id: `temp-${Date.now()}`, title: "새 포스트", draft: "" });
    setCurrentStage('strategy');
    toast.info("새로운 문서 작성을 시작합니다.");
  };

  const handleSave = async () => {
    if (!user || !activePost) {
      toast.error(!user ? "저장을 위해 로그인이 필요합니다." : "저장할 글이 없습니다.");
      return;
    }
    try {
      const savedPost = await savePostToFirestore(user.uid, activePost);
      upsertPostInList(savedPost);
      setActivePost(savedPost);
      toast.success("글이 성공적으로 저장되었습니다.");
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  const stages: { id: Stage; name: string; icon: ReactElement }[] = [
    { id: 'strategy', name: '1. 전략 & 초고', icon: <Search/> },
    { id: 'refinement', name: '2. AI 퇴고', icon: <Brain/> },
    { id: 'publish', name: '3. 발행 & 활용', icon: <Share2/> },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-gray-800 text-white flex flex-col z-30 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
        <div className={`w-72 h-full flex flex-col transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center h-16 border-b border-gray-700 flex-shrink-0 px-4">
                <Sparkles className="h-8 w-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white ml-2 whitespace-nowrap">씀.</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <ActionButton onClick={handleNewPost} icon={<FilePlus size={20}/>} text="새 글 작성" />
                        <ActionButton onClick={() => openModal('pasteText')} icon={<UploadCloud size={20}/>} text="외부 글 가져오기" />
                        <ActionButton onClick={handleSave} icon={<Save size={20}/>} text="글 저장하기" disabled={!user} />
                        <ActionButton onClick={() => openModal('loadPost')} icon={<FolderOpen size={20}/>} text="글 불러오기" disabled={!user} />
                    </div>
                </div>
                <nav className="p-4">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">작업 단계</p>
                    {stages.map(stage => {
                        const isCurrent = currentStage === stage.id;
                        const isDisabled = stage.id !== 'strategy' && !activePost;
                        return (
                            <button key={stage.id} onClick={() => !isDisabled && setCurrentStage(stage.id)} disabled={isDisabled}
                                className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-md transition-colors ${isCurrent ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {React.cloneElement(stage.icon, { className: 'w-5 h-5 mr-3' })} {stage.name}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-700 flex-shrink-0 space-y-4">
                <StyleAnalyzer />
            </div>
        </div>
    </aside>
  );
}
'use client';

// ReactElement를 React에서 직접 가져옵니다.
import React, { type ReactElement, type ReactNode } from 'react';
import { useBlogStore, type Stage } from './stages/blog-store';
import { useModalStore } from './stages/modal-store';
import { useAuth } from './AuthContext';
import { savePostToFirestore } from '@/firebase/post';
import { toast } from 'sonner';
import { FilePlus, UploadCloud, Save, FolderOpen, Search, Brain, Share2, Sparkles } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
  const { user } = useAuth();
  const { activePost, setActivePost, upsertPostInList, currentStage, setCurrentStage } = useBlogStore();
  const { openModal } = useModalStore();

  const handleNewPost = () => {
    // ... handleNewPost 함수 내용은 그대로 ...
  };
  const handleSave = async () => {
    // ... handleSave 함수 내용은 그대로 ...
  };

  // stages 배열의 icon 타입을 ReactElement로 정밀하게 수정합니다.
  const stages: { id: Stage; name: string; icon: ReactElement }[] = [
    { id: 'strategy', name: '1. 전략 & 초고', icon: <Search/> },
    { id: 'refinement', name: '2. AI 퇴고', icon: <Brain/> },
    { id: 'publish', name: '3. 발행 & 활용', icon: <Share2/> },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-gray-800 text-white flex flex-col z-30 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
        <div className="w-72 h-full flex flex-col">
            <div className="flex items-center justify-center h-16 border-b border-gray-700 flex-shrink-0 px-4">
                <Sparkles className="h-8 w-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white ml-2 whitespace-nowrap">씀.</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                         <button onClick={handleNewPost} className="flex flex-col items-center justify-center p-2 text-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FilePlus size={20}/> <span className="text-xs mt-1.5 whitespace-nowrap">새 글 작성</span>
                        </button>
                        <button onClick={() => openModal('pasteText')} className="flex flex-col items-center justify-center p-2 text-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <UploadCloud size={20}/> <span className="text-xs mt-1.5 whitespace-nowrap">외부 글 가져오기</span>
                        </button>
                        <button onClick={handleSave} className="flex flex-col items-center justify-center p-2 text-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <Save size={20}/> <span className="text-xs mt-1.5 whitespace-nowrap">글 저장하기</span>
                        </button>
                        <button onClick={() => openModal('loadPost')} className="flex flex-col items-center justify-center p-2 text-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FolderOpen size={20}/> <span className="text-xs mt-1.5 whitespace-nowrap">글 불러오기</span>
                        </button>
                    </div>
                </div>
                <nav className="p-4">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">작업 단계</p>
                    {stages.map(stage => {
                        const isCurrent = currentStage === stage.id;
                        const isDisabled = stage.id !== 'strategy' && !activePost;
                        return (
                            <button key={stage.id} 
                                onClick={() => !isDisabled && setCurrentStage(stage.id)} 
                                disabled={isDisabled}
                                className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-md transition-colors ${isCurrent ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {React.cloneElement(stage.icon, { className: 'w-5 h-5 mr-3' })} {stage.name}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    </aside>
  );
}
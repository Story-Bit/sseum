'use client';

import React, { useState, useEffect } from 'react';
import { FilePlus, Save, UploadCloud, Search, Brain, Share2, Wand2, Loader, ChevronDown, Trash2 } from 'lucide-react';
import { useBlog, type Stage, type BlogData } from './BlogContext';
import { useAuth } from './AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { cn } from '@/lib/utils';

interface SidebarProps { isSidebarOpen: boolean; }

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const { 
    posts, setPosts,
    activePost, setActivePost,
    currentStage, setCurrentStage,
    resetWorkspace,
    handleSavePost,
    setIsAboutModalOpen, setIsStyleModalOpen, setIsPasteModalOpen,
    deletePost
  } = useBlog();
  
  const { userId, appId, showToast } = useAuth();
  const [isPostListOpen, setIsPostListOpen] = useState(true);

  useEffect(() => {
    if (userId && appId) {
      const fetchPosts = async () => {
        try {
          const postsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'posts');
          const q = query(postsCollectionRef, orderBy('updatedAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogData[];
          setPosts(fetchedPosts);
        } catch (error) {
          showToast("저장된 글을 불러오는 데 실패했습니다.", "error");
        }
      };
      fetchPosts();
    }
  }, [userId, appId, setPosts, showToast]);

  const handleStageClick = (stageId: Stage) => {
    if (!activePost && stageId !== 'strategy') {
      showToast("먼저 글을 선택하거나 새로 작성해주세요.", "error");
      return;
    }
    setCurrentStage(stageId);
  };
  
  return (
    <aside className={`fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="w-72 h-full flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-700/50 flex-shrink-0 px-4">
          <button onClick={() => setIsAboutModalOpen(true)}><h1 className="text-2xl font-bold">씀.</h1></button>
        </div>
        
        <div className="p-4 border-b border-gray-700/50">
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={resetWorkspace} icon={<FilePlus size={20} />} text="새 글 작성" />
            <ActionButton onClick={() => setIsPasteModalOpen(true)} icon={<UploadCloud size={20} />} text="외부 글 가져오기" />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4">
            <nav className="space-y-1">
              <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">작업 단계</p>
              <button onClick={() => { setActivePost(null); setCurrentStage('strategy'); }} className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${!activePost ? 'bg-blue-600' : 'hover:bg-gray-700'}`}><Search className='w-5 h-5 mr-3' /> 전략 & 초고</button>
              <button disabled={!activePost} onClick={() => handleStageClick('refinement')} className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentStage === 'refinement' && activePost ? 'bg-blue-600' : 'hover:bg-gray-700'} disabled:opacity-50`}><Brain className='w-5 h-5 mr-3' /> AI 퇴고</button>
              <button disabled={!activePost} onClick={() => handleStageClick('publish')} className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentStage === 'publish' && activePost ? 'bg-blue-600' : 'hover:bg-gray-700'} disabled:opacity-50`}><Share2 className='w-5 h-5 mr-3' /> 발행 & 활용</button>
            </nav>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 border-t border-gray-700/50">
            <button onClick={() => setIsPostListOpen(!isPostListOpen)} className="w-full flex justify-between items-center py-4">
              <p className="text-sm font-semibold text-gray-300">저장된 글</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isPostListOpen ? 'rotate-180' : ''}`} />
            </button>
            {isPostListOpen && (
              <div className="space-y-1 pb-4 animate-fade-in">
                {posts.map((post) => (
                  <div key={post.id} className="group flex items-center justify-between rounded-md hover:bg-gray-700/50">
                    <button
                      onClick={() => { setActivePost(post); setCurrentStage('refinement'); }}
                      className={cn('flex-1 block p-3 text-left transition-colors rounded-l-md min-w-0', activePost?.id === post.id ? 'bg-gray-700' : '')}
                    >
                      <h3 className="font-semibold text-sm truncate">{post.title || '제목 없음'}</h3>
                    </button>
                    <button 
                      onClick={() => deletePost(post.id)} 
                      className="p-3 text-gray-500 hover:text-red-400 transition-colors rounded-r-md"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {posts.length === 0 && (<div className="px-2 py-5 text-center text-gray-500 text-sm">저장된 글이 없습니다.</div>)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700/50">
          <ActionButton onClick={handleSavePost} icon={<Save size={20} />} text="현재 글 저장" />
          <div className="mt-4">
            <button onClick={() => setIsStyleModalOpen(true)} className="w-full flex items-center justify-center p-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"><Wand2 size={16} className="mr-3 text-blue-400"/> 나만의 글쓰기 스타일</button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const ActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; text: string }> = ({ onClick, icon, text }) => (
  <button onClick={onClick} className="w-full flex items-center justify-center p-3 text-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
    {icon}
    <span className="text-sm font-semibold ml-2">{text}</span>
  </button>
);

export default Sidebar;
// 이 파일의 기존 내용을 모두 삭제하고 아래의 완벽한 코드로 교체하십시오.

'use client';

import React from 'react';
import { useAuth } from '../AuthContext';
import { db } from '@/firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';
import { Loader, X, Trash2 } from 'lucide-react';
// 1. 새로운 심장 useBlogStore와 PostType을 가져옵니다.
import { useBlogStore, PostType } from '../stages/blog-store';
import { toast } from 'sonner';

interface LoadPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onLoadPost는 이제 setActivePost로 대체되므로, 직접적인 prop은 필요 없어졌습니다.
}

const LoadPostModal: React.FC<LoadPostModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  // 2. 중앙 기록 보관소에서 필요한 모든 것을 가져옵니다.
  const { posts, setActivePost, removePostFromList, isLoading } = useBlogStore();

  const handleLoadPost = (post: PostType) => {
    setActivePost(post); // 글을 선택하면 중앙 저장소의 activePost를 설정합니다.
    toast.success(`'${post.title}' 글을 불러왔습니다.`);
    onClose(); // 모달을 닫습니다.
  };

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (window.confirm("정말로 이 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        const docRef = doc(db, `users/${user.uid}/posts`, postId);
        await deleteDoc(docRef);
        removePostFromList(postId); // 중앙 저장소에서도 해당 글을 제거합니다.
        toast.success("글이 성공적으로 삭제되었습니다.");
      } catch (error) {
        console.error("글 삭제 오류:", error);
        toast.error("글을 삭제하는 중 오류가 발생했습니다.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 animate-modal-pop">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">글 불러오기</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1"><X /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* 3. 더 이상 자체 로딩이 아닌, 중앙 로딩 상태를 확인합니다. */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader className="animate-spin text-blue-500" /></div>
          ) : posts.length > 0 ? (
            <ul className="space-y-2">
              {posts.map(post => (
                <li key={post.id} className="flex items-center gap-2">
                  <button onClick={() => handleLoadPost(post)} className="flex-1 text-left p-3 rounded-lg border bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <p className="font-semibold text-gray-800">{post.title || '제목 없음'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {post.updatedAt?.toDate ? new Date(post.updatedAt.toDate()).toLocaleString() : '날짜 정보 없음'}
                    </p>
                  </button>
                  <button onClick={(e) => handleDelete(post.id, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-10">저장된 글이 없습니다.</p>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default LoadPostModal;
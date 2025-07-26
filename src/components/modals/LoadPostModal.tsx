'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { db } from '@/firebase/config';
import { collection, query, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Loader, X, Trash2 } from 'lucide-react';
import { type BlogData } from '@/components/BlogContext';

interface LoadPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPost: (post: BlogData) => void;
}

const LoadPostModal: React.FC<LoadPostModalProps> = ({ isOpen, onClose, onLoadPost }) => {
  const { userId, appId, showToast } = useAuth();
  const [posts, setPosts] = useState<BlogData[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // 모달이 열릴 때마다 Firestore에서 글 목록을 직접 불러옵니다.
  useEffect(() => {
    if (isOpen && userId && appId) {
      const fetchPosts = async () => {
        setIsFetching(true);
        try {
          const collectionPath = `artifacts/${appId}/users/${userId}/posts`;
          const q = query(collection(db, collectionPath), orderBy('updatedAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const fetchedPosts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as BlogData[];
          setPosts(fetchedPosts);
        } catch (error) {
          console.error("게시물 가져오기 오류: ", error);
          showToast("글 목록을 불러오는 데 실패했습니다.", "error");
        } finally {
          setIsFetching(false);
        }
      };
      fetchPosts();
    }
  }, [isOpen, userId, appId, showToast]); // showToast를 의존성 배열에 추가

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !appId) return;
    if (window.confirm("정말로 이 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/posts`, postId);
        await deleteDoc(docRef);
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
        showToast("글이 성공적으로 삭제되었습니다.", "success");
      } catch (error) {
        console.error("글 삭제 오류:", error);
        showToast("글을 삭제하는 중 오류가 발생했습니다.", "error");
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
          {isFetching ? (
            <div className="flex justify-center items-center h-40"><Loader className="animate-spin text-blue-500" /></div>
          ) : posts.length > 0 ? (
            <ul className="space-y-2">
              {posts.map(post => (
                <li key={post.id} className="flex items-center gap-2">
                  <button onClick={() => onLoadPost(post)} className="flex-1 text-left p-3 rounded-lg border bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <p className="font-semibold text-gray-800">{post.title || '제목 없음'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(post as any).updatedAt?.toDate ? new Date((post as any).updatedAt.toDate()).toLocaleString() : '날짜 정보 없음'}
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
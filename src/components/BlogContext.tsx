"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export type Stage = 'strategy' | 'refinement' | 'publish';

export interface BlogData {
  id: string;
  title: string;
  draft: string;
  outline: string;
  generatedAssets: Record<string, any>;
  mainKeyword: string;
  isPublished?: boolean;
}

interface BlogContextType {
  posts: BlogData[];
  setPosts: Dispatch<SetStateAction<BlogData[]>>;
  activePost: BlogData | null;
  setActivePost: Dispatch<SetStateAction<BlogData | null>>;
  currentStage: Stage;
  setCurrentStage: Dispatch<SetStateAction<Stage>>;
  strategyResult: any;
  setStrategyResult: Dispatch<SetStateAction<any>>;
  isGeneratingDraft: boolean;
  setGeneratingDraft: Dispatch<SetStateAction<boolean>>;
  isLoadModalOpen: boolean;
  setIsLoadModalOpen: Dispatch<SetStateAction<boolean>>;
  isPasteModalOpen: boolean;
  setIsPasteModalOpen: Dispatch<SetStateAction<boolean>>;
  isAboutModalOpen: boolean;
  setIsAboutModalOpen: Dispatch<SetStateAction<boolean>>;
  isStyleModalOpen: boolean;
  setIsStyleModalOpen: Dispatch<SetStateAction<boolean>>;
  resetWorkspace: () => void;
  handleSavePost: () => Promise<void>;
  handleLoadPost: (post: BlogData) => void;
  handlePastePost: (text: string) => void;
  deletePost: (postId: string) => Promise<void>;
  createNewPost: () => Promise<string | undefined>;
  generateDraft: (postId: string, data: { title: string; draft: string; outline: string; mainKeyword: string }) => void;
}

const BlogContext = createContext<BlogContextType | null>(null);

export const useBlog = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error('useBlog must be used within BlogProvider');
  return ctx;
};

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const { userId, appId, showToast } = useAuth();
  const [posts, setPosts] = useState<BlogData[]>([]);
  const [activePost, setActivePost] = useState<BlogData | null>(null);
  const [currentStage, setCurrentStage] = useState<Stage>('strategy');
  const [strategyResult, setStrategyResult] = useState<any>(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isGeneratingDraft, setGeneratingDraft] = useState(false);

  const resetWorkspace = () => {
    setActivePost(null);
    setStrategyResult(null);
    setCurrentStage('strategy');
    showToast("새로운 창작을 시작합니다.", "info");
  };

  const handleLoadPost = (post: BlogData) => {
    setActivePost(post);
    setStrategyResult(null);
    setCurrentStage('refinement');
    setIsLoadModalOpen(false);
    showToast("글을 불러왔습니다.", "info");
  };
  
  const handlePastePost = (pastedText: string) => {
    if (!pastedText.trim()) {
        showToast("붙여넣을 내용이 없습니다.", "error");
        return;
    }
    const tempPost: BlogData = {
        id: `temp_${Date.now()}`,
        title: pastedText.substring(0, 30) + "...",
        draft: pastedText,
        outline: '',
        generatedAssets: {},
        mainKeyword: '',
        isPublished: false,
    };
    setActivePost(tempPost);
    setStrategyResult(null);
    setCurrentStage('refinement');
    setIsPasteModalOpen(false);
    showToast("글을 성공적으로 불러왔습니다. '현재 글 저장'을 눌러 서버에 보관하세요.", "info");
  };

  const handleSavePost = async () => {
    if (!activePost) { showToast("저장할 글이 없습니다.", "error"); return; }
    if (!activePost.title?.trim() && !activePost.draft?.trim()) { showToast("제목이나 내용이 없어 저장할 수 없습니다.", "error"); return; }
    if (!userId) { showToast("로그인이 필요합니다.", "error"); return; }

    showToast("저장 중...", "info");
    try {
      const isTemporary = activePost.id.startsWith('temp_');
      const postRef = isTemporary
        ? doc(collection(db, `artifacts/${appId}/users/${userId}/posts`))
        : doc(db, `artifacts/${appId}/users/${userId}/posts`, activePost.id);
      
      const dataToSave = {
        title: activePost.title,
        draft: activePost.draft,
        outline: activePost.outline,
        mainKeyword: activePost.mainKeyword,
        updatedAt: serverTimestamp(),
        ...(isTemporary && { createdAt: serverTimestamp() })
      };

      await setDoc(postRef, dataToSave, { merge: true });
      
      const newId = postRef.id;
      const savedPost = { ...activePost, id: newId };
      
      setActivePost(savedPost);
      
      setPosts(prevPosts => {
        const postExists = prevPosts.some(p => p.id === newId);
        if (postExists) {
          return prevPosts.map(p => p.id === newId ? savedPost : p);
        } else {
          return [savedPost, ...prevPosts];
        }
      });
      showToast("성공적으로 저장되었습니다.", "success");
    } catch (error) {
      showToast("저장 중 오류가 발생했습니다.", "error");
    }
  };

  const deletePost = async (postId: string) => {
    if (!userId || !appId) {
        showToast("사용자 정보가 없어 삭제할 수 없습니다.", "error");
        return;
    }
    if (window.confirm("정말로 이 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
        try {
            const docRef = doc(db, `artifacts/${appId}/users/${userId}/posts`, postId);
            await deleteDoc(docRef);
            
            if (activePost?.id === postId) {
                resetWorkspace();
            }
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            showToast("글이 성공적으로 삭제되었습니다.", "success");
        } catch (error) {
            console.error("글 삭제 오류:", error);
            showToast("글을 삭제하는 중 오류가 발생했습니다.", "error");
        }
    }
  };

  const createNewPost = async () => {
    if (!userId || !appId) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }
    const newPostData = { title: '새 포스트', draft: '', outline: '', generatedAssets: {}, mainKeyword: '', isPublished: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    try {
      const postsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'posts');
      const docRef = await addDoc(postsCollectionRef, newPostData);
      const newPostWithId: BlogData = { ...newPostData, id: docRef.id };
      setPosts(prevPosts => [newPostWithId, ...prevPosts]);
      setActivePost(newPostWithId);
      setCurrentStage('refinement');
      showToast("새 글이 생성 및 저장되었습니다.", "success");
      return docRef.id;
    } catch (error) {
      showToast("새 글 생성 중 오류가 발생했습니다.", "error");
    }
  };
  
  const generateDraft = (postId: string, data: { title: string; draft: string; outline: string; mainKeyword: string }) => {
    const newPostData = { ...activePost, ...data, id: postId };
    setActivePost(newPostData as BlogData);
    setCurrentStage('refinement');
  };

  return (
    <BlogContext.Provider value={{
      posts, setPosts,
      activePost, setActivePost,
      currentStage, setCurrentStage,
      strategyResult, setStrategyResult,
      isGeneratingDraft, setGeneratingDraft,
      isLoadModalOpen, setIsLoadModalOpen,
      isPasteModalOpen, setIsPasteModalOpen,
      isAboutModalOpen, setIsAboutModalOpen,
      isStyleModalOpen, setIsStyleModalOpen,
      resetWorkspace,
      handleSavePost,
      handleLoadPost,
      handlePastePost,
      deletePost,
      createNewPost,
      generateDraft
    }}>
      {children}
    </BlogContext.Provider>
  );
};
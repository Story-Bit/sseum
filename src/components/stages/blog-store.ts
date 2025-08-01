'use client';

import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';

export interface PostType {
  id: string;
  title: string;
  draft: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  strategyResult?: Record<string, any>;
}

export interface StrategyResult {
  type: 'new_idea' | 'competitor';
  data: any;
}

export type Stage = 'strategy' | 'refinement' | 'publish';

interface BlogState {
  posts: PostType[];
  activePost: PostType | null;
  isLoading: boolean;
  loadingMessage: string;
  strategyResult: StrategyResult | null;
  currentStage: Stage;

  setLoading: (isLoading: boolean, message?: string) => void;
  loadPosts: (posts: PostType[]) => void;
  setActivePost: (post: PostType | null) => void;
  upsertPostInList: (postToUpsert: PostType) => void;
  // 여기에 삭제 기능의 설계도를 추가합니다.
  removePostFromList: (postIdToDelete: string) => void;
  setStrategyResult: (result: StrategyResult | null) => void;
  setCurrentStage: (stage: Stage) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  activePost: null,
  isLoading: false,
  loadingMessage: '작업을 처리 중입니다...',
  strategyResult: null,
  currentStage: 'strategy',

  setLoading: (isLoading, message = '작업을 처리 중입니다...') =>
    set({ isLoading, loadingMessage: message }),
  loadPosts: (posts) => set({ posts }),
  setActivePost: (post) => set({ activePost: post }),
  upsertPostInList: (postToUpsert) =>
    set((state) => {
      const index = state.posts.findIndex((p) => p.id === postToUpsert.id);
      let newPosts = [...state.posts];
      if (index !== -1) {
        newPosts[index] = postToUpsert;
      } else {
        newPosts = [postToUpsert, ...state.posts];
      }
      return { posts: newPosts };
    }),
  // 여기에 삭제 기능의 실제 구현을 추가합니다.
  removePostFromList: (postIdToDelete) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postIdToDelete),
    })),
  setStrategyResult: (result) => set({ strategyResult: result }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
}));
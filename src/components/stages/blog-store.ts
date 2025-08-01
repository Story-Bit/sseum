// 이 파일의 기존 내용을 모두 삭제하고 아래의 강화된 코드로 교체하십시오.

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

interface BlogState {
  posts: PostType[];
  activePost: PostType | null;
  isLoading: boolean;
  loadingMessage: string;
  // [추가] 전략 분석 결과를 저장할 새로운 공간
  strategyResult: { type: 'new_idea' | 'competitor', data: any } | null;

  setLoading: (isLoading: boolean, message?: string) => void;
  loadPosts: (posts: PostType[]) => void;
  setActivePost: (post: PostType | null) => void;
  upsertPostInList: (postToUpsert: PostType) => void;
  removePostFromList: (postIdToDelete: string) => void;
  // [추가] 전략 분석 결과를 설정할 새로운 함수
  setStrategyResult: (result: { type: 'new_idea' | 'competitor', data: any } | null) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  activePost: null,
  isLoading: false,
  loadingMessage: '작업을 처리 중입니다...',
  // [추가] strategyResult 초기 상태
  strategyResult: null,

  setLoading: (isLoading, message = '작업을 처리 중입니다...') =>
    set({ isLoading, loadingMessage: message }),
  loadPosts: (posts) => set({ posts }),
  setActivePost: (post) => set({ activePost: post }),
  upsertPostInList: (postToUpsert) =>
    set((state) => {
      const index = state.posts.findIndex((p) => p.id === postToUpsert.id);
      let newPosts: PostType[];
      if (index !== -1) {
        newPosts = [...state.posts];
        newPosts[index] = postToUpsert;
      } else {
        newPosts = [postToUpsert, ...state.posts];
      }
      return { posts: newPosts };
    }),
  removePostFromList: (postIdToDelete) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postIdToDelete),
    })),
  // [추가] setStrategyResult 함수 구현
  setStrategyResult: (result) => set({ strategyResult: result }),
}));
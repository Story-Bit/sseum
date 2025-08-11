// /src/components/stages/journeyStore.ts

import { create } from 'zustand';

// --- 타입 정의 ---
export interface KOSResult { keyword: string; kosScore: number; explanation: string; }
export interface TopicCluster { mainTopic: string; subTopics: string[]; }
export interface RecommendedPost { title: string; tactic: string; }
export interface Persona { name: string; description: string; recommendedPosts: RecommendedPost[]; }
export interface StrategyDetails { topicClusters: TopicCluster[]; personas: Persona[]; }
export interface SavedStrategy { id: string; mainKeyword: string; updatedAt: string; }
export interface FullStrategyData { id?: string; mainKeyword: string; kosResults: KOSResult[]; strategyDetails: StrategyDetails | null; }
export interface CompetitorAnalysisResult { analysis: string; suggestedTitles: string[]; suggestedOutline: string; }

// --- 중앙 상태 관리소 (Zustand) ---
interface JourneyState {
  step: number; totalSteps: number; strategyMode: 'new' | 'competitor' | null; isLoading: boolean; mainKeyword: string;
  savedStrategies: SavedStrategy[]; strategyResult: FullStrategyData | null; competitorResult: CompetitorAnalysisResult | null;
  kosResults: KOSResult[]; selectedKos: KOSResult | null; strategyDetails: StrategyDetails | null;
  nextStep: () => void; prevStep: () => void; setStep: (step: number) => void; setStrategyMode: (mode: 'new' | 'competitor' | null) => void;
  setLoading: (status: boolean) => void; setMainKeyword: (keyword: string) => void; setStrategyResult: (result: FullStrategyData | null) => void;
  setCompetitorResult: (result: CompetitorAnalysisResult | null) => void; setSavedStrategies: (strategies: SavedStrategy[]) => void;
  removeSavedStrategy: (strategyId: string) => void; reset: () => void; setKosResults: (results: KOSResult[]) => void;
  setSelectedKos: (kos: KOSResult | null) => void; setStrategyDetails: (details: StrategyDetails | null) => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  step: 1, totalSteps: 4, strategyMode: null, isLoading: false, mainKeyword: '', savedStrategies: [],
  strategyResult: null, competitorResult: null, kosResults: [], selectedKos: null, strategyDetails: null,
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  setStep: (step) => set({ step }), setStrategyMode: (mode) => set({ strategyMode: mode }),
  setLoading: (status) => set({ isLoading: status }), setMainKeyword: (keyword) => set({ mainKeyword: keyword }),
  setStrategyResult: (result) => set({ strategyResult: result, competitorResult: null }),
  setCompetitorResult: (result) => set({ competitorResult: result, strategyResult: null }),
  setSavedStrategies: (strategies) => set({ savedStrategies: strategies }),
  removeSavedStrategy: (strategyId) => set((state) => ({ savedStrategies: state.savedStrategies.filter(s => s.id !== strategyId) })),
  reset: () => set({ step: 1, strategyMode: null, mainKeyword: '', strategyResult: null, competitorResult: null, isLoading: false, kosResults: [], selectedKos: null, strategyDetails: null }),
  setKosResults: (results) => set({ kosResults: results }), setSelectedKos: (kos) => set({ selectedKos: kos }),
  setStrategyDetails: (details) => set({ strategyDetails: details }),
}));
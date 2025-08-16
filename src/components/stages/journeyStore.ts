import { create } from 'zustand';

// --- 데이터 스키마 정의 (The Pact of Data Clarity) ---
interface JourneyData {
  topic: string;
  strategyAnalysis: {
    recommendations: any[]; // Placeholder for tab 1
    draftLevel: 'beginner' | 'intermediate' | 'advanced' | null; // For tab 2
    outline: string; // For tab 3
  };
  draft: string;
}

// The names of the steps for the Constellation Navigator
const STEP_NAMES = ["주제 선정", "전략 분석", "초안 생성", "최종 퇴고"];

interface JourneyState extends JourneyData {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  setTopic: (topic: string) => void;
  setStrategyAnalysis: (analysis: Partial<JourneyState['strategyAnalysis']>) => void;
  setDraft: (draft: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetJourney: () => void;
}

const initialState: JourneyData = {
  topic: '',
  strategyAnalysis: {
    recommendations: [],
    draftLevel: null,
    outline: '',
  },
  draft: '',
};

// --- 중앙 상태 관리소 (Zustand) ---
export const useJourneyStore = create<JourneyState>((set) => ({
  ...initialState,
  currentStep: 1,
  totalSteps: STEP_NAMES.length,
  steps: STEP_NAMES,
  setTopic: (topic) => set({ topic, strategyAnalysis: initialState.strategyAnalysis }), // Reset strategy when topic changes
  setStrategyAnalysis: (analysis) => set((state) => ({
    strategyAnalysis: { ...state.strategyAnalysis, ...analysis },
  })),
  setDraft: (draft) => set({ draft }),
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps),
  })),
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1),
  })),
  goToStep: (step) => set((state) => {
    if (step <= state.currentStep) {
      return { currentStep: step };
    }
    return {};
  }),
  resetJourney: () => set({ ...initialState, currentStep: 1 }),
}));
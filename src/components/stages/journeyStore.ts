import { create } from 'zustand';

// --- 데이터 스키마 정의 (The Pact of Data Clarity) ---
interface Persona {
  name: string;
  description: string;
}

interface JourneyData {
  topic: string;
  persona: Persona | null;
  outline: string;
  draft: string;
}

interface JourneyState extends JourneyData {
  currentStep: number;
  totalSteps: number;
  setTopic: (topic: string) => void;
  setPersona: (persona: Persona) => void;
  setOutline: (outline: string) => void;
  setDraft: (draft: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetJourney: () => void;
}

const initialState: JourneyData = {
  topic: '',
  persona: null,
  outline: '',
  draft: '',
};

// --- 중앙 상태 관리소 (Zustand) ---
export const useJourneyStore = create<JourneyState>((set) => ({
  ...initialState,
  currentStep: 1,
  totalSteps: 4, // 예: 주제선정 -> 페르소나 -> 목차 -> 초고
  setTopic: (topic) => set({ topic }),
  setPersona: (persona) => set({ persona }),
  setOutline: (outline) => set({ outline }),
  setDraft: (draft) => set({ draft }),
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps),
  })),
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1),
  })),
  goToStep: (step) => set((state) => {
    // 완료된 단계로만 이동 가능하도록 보장 (현재 단계보다 작거나 같으면)
    if (step <= state.currentStep) {
      return { currentStep: step };
    }
    return {};
  }),
  resetJourney: () => set({ ...initialState, currentStep: 1 }),
}));
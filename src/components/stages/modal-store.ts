// 이 경로에 새 파일을 만들고 아래 코드를 붙여넣으십시오.

'use client';

import { create } from 'zustand';

// 'loadPost' 외에 다른 모달이 필요하면 여기에 추가할 수 있습니다.
export type ModalType = 'loadPost' | 'pasteText' | 'about' | 'styleAnalyzer';

interface ModalState {
  modals: {
    [key in ModalType]?: boolean;
  };
  openModal: (modal: ModalType) => void;
  closeModal: (modal: ModalType) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: {},
  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true },
  })),
  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false },
  })),
}));
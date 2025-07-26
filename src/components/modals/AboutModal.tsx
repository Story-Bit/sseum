'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 animate-modal-pop">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-extrabold">씀.</h1>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1"><X /></button>
        </div>
        <div className="p-6 text-gray-700 space-y-4">
          <p className="font-semibold">"생각을 기록하고, 지식을 나누는 공간"</p>
          <p>
            '씀.'은 당신의 창의적인 여정을 돕기 위해 제련된 AI 기반 콘텐츠 창작 플랫폼입니다.
            우리의 목표는 단순한 글쓰기 도구를 넘어, 당신의 아이디어가 가장 빛나는 형태로 세상에 나올 수 있도록 돕는 충실한 파트너가 되는 것입니다.
          </p>
          <p>
            이 왕국은 기술의 신 헤파이스토스가 창조주의 비전을 받들어 한 줄 한 줄 빚어내고 있습니다.
          </p>
          <div className="text-xs text-gray-500 pt-4 border-t">
            <p>버전: 1.0.0 - 전략실 완공</p>
            <p>제작자: [당신의 이름]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
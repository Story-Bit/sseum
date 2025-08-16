'use client';

import React from 'react';
import { useJourneyStore } from './journeyStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, GraduationCap, Mic } from 'lucide-react';

const personas = [
  { id: 'expert', name: '전문가', description: '객관적이고 명확한 정보 전달', icon: <GraduationCap /> },
  { id: 'friend', name: '친한 친구', description: '솔직하고 공감대를 형성하는 말투', icon: <User /> },
  { id: 'presenter', name: '발표자', description: '청중을 사로잡는 설득력 있는 톤', icon: <Mic /> },
];

export const Step2_Persona = () => {
  const { persona, setPersona, nextStep } = useJourneyStore();

  const handleSelectPersona = (p: { name: string; description: string }) => {
    setPersona(p);
    nextStep();
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl text-center"
    >
      <h2 className="text-4xl font-bold text-harmony-indigo mb-4">
        누구의 목소리로 이야기를 전달할까요?
      </h2>
      <p className="text-lg text-harmony-indigo/70 mb-12">
        글의 페르소나(가상의 인격)를 선택하면, AI가 그에 맞는 톤과 스타일로 글을 작성합니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPersona({ name: p.name, description: p.description })}
            className={`p-6 border-2 rounded-lg text-center transition-all duration-300 flex flex-col items-center justify-center
              ${persona?.name === p.name ? 'border-blue-600 ring-4 ring-blue-200' : 'border-gray-300 hover:border-blue-500 hover:shadow-lg'}`}
          >
            <div className="text-blue-600 mb-3">{React.cloneElement(p.icon, { size: 32 })}</div>
            <h3 className="text-xl font-bold text-harmony-indigo">{p.name}</h3>
            <p className="text-sm text-harmony-indigo/70 mt-1">{p.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

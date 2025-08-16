'use client';

import React from 'react';
import { useJourneyStore } from './journeyStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

export const Step1_Topic = () => {
  const { topic, setTopic, nextStep } = useJourneyStore();

  const handleNext = () => {
    if (topic.trim()) {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl text-center"
    >
      <h2 className="text-4xl font-bold text-harmony-indigo mb-4">
        어떤 위대한 이야기에 대한 초고를 작성해볼까요?
      </h2>
      <p className="text-lg text-harmony-indigo/70 mb-8">
        가장 핵심적인 주제나 키워드를 알려주세요.
      </p>
      <Input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="예: 제미나이 API를 활용한 AI 에이전트 구축"
        className="text-center text-xl h-14 mb-8"
        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
      />
      <Button size="lg" onClick={handleNext} disabled={!topic.trim()}>
        다음 단계로 <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
};

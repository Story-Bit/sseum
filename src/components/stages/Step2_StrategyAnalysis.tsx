'use client';

import React from 'react';
import { useJourneyStore } from './journeyStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Lightbulb, ListChecks, BarChart } from 'lucide-react';

export const Step2_StrategyAnalysis = () => {
  const { strategyAnalysis, setStrategyAnalysis, nextStep } = useJourneyStore();

  // This is a placeholder for the actual AI analysis logic
  const recommendations = [
    { title: "Gemini API 기본 사용법", score: 85 },
    { title: "AI 챗봇 개발 튜토리얼", score: 78 },
    { title: "LangChain 연동하기", score: 92 },
  ];
  const outline = "1. 서론: AI 에이전트의 중요성\n2. 본론 1: Gemini API 키 발급받기\n3. 본론 2: 핵심 기능 구현하기\n4. 결론: AI 에이전트의 미래";

  const handleSelectLevel = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setStrategyAnalysis({ draftLevel: level });
    // In a real app, we might wait for all tabs to be interacted with
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl text-center"
    >
      <h2 className="text-4xl font-bold text-harmony-indigo mb-4">
        AI가 분석한 전략을 확인하고, 초고의 방향을 결정하세요.
      </h2>
      <p className="text-lg text-harmony-indigo/70 mb-12">
        AI가 제안하는 전략을 바탕으로, 당신의 글을 가장 효과적으로 제련할 수 있습니다.
      </p>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations"><Lightbulb className="mr-2 h-4 w-4"/> 추천 소재</TabsTrigger>
          <TabsTrigger value="draft-level"><BarChart className="mr-2 h-4 w-4"/> 단계별 초안</TabsTrigger>
          <TabsTrigger value="outline"><ListChecks className="mr-2 h-4 w-4"/> 목차 제안</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="p-6 border rounded-b-md mt-0">
            <p className="text-left text-sm text-muted-foreground mb-4">AI가 분석한 관련성 및 시장성 기반 추천 소재입니다.</p>
            <div className="space-y-3">
                {recommendations.map(rec => (
                    <div key={rec.title} className="flex justify-between items-center p-4 bg-slate-100 rounded-lg">
                        <span className="font-semibold">{rec.title}</span>
                        <span className="text-sm font-bold text-blue-600">{rec.score}점</span>
                    </div>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="draft-level" className="p-6 border rounded-b-md mt-0">
            <p className="text-left text-sm text-muted-foreground mb-4">독자의 수준에 맞춰 AI가 생성할 초고의 깊이를 선택합니다.</p>
            <div className="grid grid-cols-3 gap-4">
                <Button variant={strategyAnalysis.draftLevel === 'beginner' ? 'default' : 'outline'} onClick={() => handleSelectLevel('beginner')}>초급</Button>
                <Button variant={strategyAnalysis.draftLevel === 'intermediate' ? 'default' : 'outline'} onClick={() => handleSelectLevel('intermediate')}>중급</Button>
                <Button variant={strategyAnalysis.draftLevel === 'advanced' ? 'default' : 'outline'} onClick={() => handleSelectLevel('advanced')}>고급</Button>
            </div>
        </TabsContent>

        <TabsContent value="outline" className="p-6 border rounded-b-md mt-0">
            <p className="text-left text-sm text-muted-foreground mb-4">AI가 제안하는 논리적인 글의 구조입니다. 이 목차를 기반으로 초고가 생성됩니다.</p>
            <pre className="p-4 bg-slate-100 rounded-md text-left whitespace-pre-wrap font-sans text-sm">
                {outline}
            </pre>
        </TabsContent>
      </Tabs>

      <Button size="lg" onClick={nextStep} className="mt-8">
        이 전략으로 초고 생성하기 <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
};

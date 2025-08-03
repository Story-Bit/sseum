// /src/components/stages/StrategyReport.tsx

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, Lightbulb, Library, Users, Target, ArrowLeft } from 'lucide-react';
import { useStrategyStore, StrategyResult, KOSResult, TopicCluster, Persona } from './Stage1_StrategyDraft';

// 신규 '통합 전략 보고서' 컴포넌트
export default function StrategyReport() {
  const { strategyResult, resetStrategy } = useStrategyStore();
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(
    strategyResult?.kosResults[0]?.keyword || null
  );

  // 선택된 키워드에 따라 페르소나를 재정렬하는 로직 (예시)
  const sortedPersonas = useMemo(() => {
    if (!strategyResult) return [];
    // 실제 구현에서는 키워드와 페르소나의 연관성을 분석하여 정렬해야 함
    // 여기서는 선택된 키워드와 관련된 페르소나를 맨 앞으로 가져온다고 가정
    return [...strategyResult.personas].sort((a, b) => {
        const aIsRelated = a.name.includes(selectedKeyword?.split(' ')[0] || '') || a.description.includes(selectedKeyword?.split(' ')[0] || '');
        const bIsRelated = b.name.includes(selectedKeyword?.split(' ')[0] || '') || b.description.includes(selectedKeyword?.split(' ')[0] || '');
        if (aIsRelated && !bIsRelated) return -1;
        if (!aIsRelated && bIsRelated) return 1;
        return 0;
    });
  }, [selectedKeyword, strategyResult]);


  if (!strategyResult) {
    return null; // 데이터가 없으면 렌더링하지 않음
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 animate-fade-in space-y-12">
      <Button variant="ghost" onClick={resetStrategy}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        새로운 전략 분석
      </Button>

      {/* 1. 기회의 신탁 (KOS) */}
      <section>
        <CardTitle className="flex items-center text-2xl mb-4">
          <Rocket className="mr-3 h-7 w-7 text-red-500" />
          기회의 신탁: 핵심 기회 분석
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategyResult.kosResults.map((item) => (
            <Card
              key={item.keyword}
              onClick={() => setSelectedKeyword(item.keyword)}
              className={`p-4 cursor-pointer transition-all duration-300 ${selectedKeyword === item.keyword ? 'border-primary ring-2 ring-primary shadow-xl' : 'hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{item.keyword}</h3>
                <Badge variant={item.kosScore > 80 ? 'default' : 'secondary'}>{item.kosScore}점</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{item.explanation}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. 구조의 베틀 (필러 & 클러스터) */}
      <section>
        <CardTitle className="flex items-center text-2xl mb-4">
          <Library className="mr-3 h-7 w-7 text-blue-500" />
          구조의 베틀: 콘텐츠 설계도
        </CardTitle>
        <div className="space-y-6">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-6">
                <h3 className="flex items-center font-semibold text-lg mb-2"><Lightbulb className="mr-2 h-5 w-5 text-green-600" />추천 필러 콘텐츠 전략</h3>
                <p className="text-base text-green-800 dark:text-green-300">{strategyResult.pillarContent}</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategyResult.topicClusters.map((cluster) => (
                    <div key={cluster.mainTopic} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{cluster.mainTopic}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {cluster.subTopics.map((subTopic) => (<Badge key={subTopic} variant="outline">{subTopic}</Badge>))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 3. 실행의 모루 (페르소나 & 글감) */}
      <section>
        <CardTitle className="flex items-center text-2xl mb-4">
          <Users className="mr-3 h-7 w-7 text-purple-500" />
          실행의 모루: 타겟 독자 공략
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPersonas.map((persona, index) => (
            <Card key={persona.name} className={`flex flex-col ${index === 0 ? 'border-purple-400 ring-2 ring-purple-300' : ''}`}>
              <CardHeader className={`${index === 0 ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                <h3 className="flex items-center font-bold text-lg">
                  {index === 0 && <Target className="mr-2 h-5 w-5 text-purple-600" />}
                  {index === 0 ? "핵심 타겟: " : ""}{persona.name}
                </h3>
                <CardDescription>{persona.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                {persona.recommendedPosts.map((post) => (
                  <div key={post.title} className="p-3 rounded-md bg-background hover:bg-muted/50 transition-colors border">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">[AI 공략 비급] {post.tactic}</p>
                    <Button size="sm" variant="ghost" className="w-full justify-start h-auto p-1 mt-2 text-primary">이 글감으로 초고 생성 →</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
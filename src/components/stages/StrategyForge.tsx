// /src/components/stages/StrategyForge.tsx

'use client';

import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, Lightbulb, Library, Users, Target } from 'lucide-react';

// [수정] 이 컴포넌트가 사용하는 모든 타입을 여기에 직접 정의한다.
export interface KOSResult {
  keyword: string;
  kosScore: number;
  explanation: string;
}

export interface TopicCluster {
  mainTopic: string;
  subTopics: string[];
}

export interface RecommendedPost {
  title: string;
  tactic: string;
}

export interface Persona {
  name: string;
  description: string;
  recommendedPosts: RecommendedPost[];
}

export interface StrategyResult {
  kosResults: KOSResult[];
  pillarContent: string;
  topicClusters: TopicCluster[];
  personas: Persona[];
}


// 제1패널: 기회의 신탁
const OracleOfOpportunity = ({ kosResults, selectedKeyword, onSelectKeyword }: {
  kosResults: KOSResult[];
  selectedKeyword: string | null;
  onSelectKeyword: (keyword: string) => void;
}) => (
  <Card className="h-full overflow-y-auto rounded-none border-0 border-r">
    <CardHeader>
      <CardTitle className="flex items-center text-lg"><Rocket className="mr-2 h-5 w-5 text-red-500" />기회의 신탁</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 p-4">
      <p className="text-sm text-muted-foreground pb-2">가장 승률 높은 키워드를 선택하십시오.</p>
      {kosResults.map((item) => (
        <Card
          key={item.keyword}
          onClick={() => onSelectKeyword(item.keyword)}
          className={`p-3 cursor-pointer transition-all ${selectedKeyword === item.keyword ? 'border-primary ring-2 ring-primary' : 'hover:bg-muted/50'}`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-base">{item.keyword}</h3>
            <Badge variant={item.kosScore > 80 ? 'default' : 'secondary'}>{item.kosScore}점</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{item.explanation}</p>
        </Card>
      ))}
    </CardContent>
  </Card>
);

// 제2패널: 구조의 베틀
const LoomOfStructure = ({ pillarContent, topicClusters }: {
  pillarContent: string;
  topicClusters: TopicCluster[];
}) => (
    <Card className="h-full overflow-y-auto rounded-none border-0">
        <CardHeader>
            <CardTitle className="flex items-center text-lg"><Library className="mr-2 h-5 w-5 text-blue-500" />구조의 베틀</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <h3 className="flex items-center font-semibold mb-2"><Lightbulb className="mr-2 h-4 w-4 text-green-600" />추천 필러 콘텐츠</h3>
                <p className="text-sm text-green-800 dark:text-green-300">{pillarContent}</p>
            </div>
            <div>
                <h3 className="font-semibold mb-3">주제 클러스터</h3>
                <div className="space-y-4">
                    {topicClusters.map((cluster) => (
                        <div key={cluster.mainTopic} className="p-3 border rounded-md">
                            <h4 className="font-medium text-sm">{cluster.mainTopic}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {cluster.subTopics.map((subTopic) => (<Badge key={subTopic} variant="outline">{subTopic}</Badge>))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
);

// 제3패널: 실행의 모루
const AnvilOfExecution = ({ personas }: { personas: Persona[] }) => (
    <Card className="h-full overflow-y-auto rounded-none border-0 border-l">
        <CardHeader>
            <CardTitle className="flex items-center text-lg"><Users className="mr-2 h-5 w-5 text-purple-500" />실행의 모루</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
            {personas.map((persona, index) => (
                <div key={persona.name} className={`p-4 border rounded-lg ${index === 0 ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                    <h3 className="flex items-center font-bold">
                        {index === 0 && <Target className="mr-2 h-4 w-4 text-purple-600" />}
                        {index === 0 ? "핵심 타겟: " : "รอง 타겟: "}{persona.name}
                    </h3>
                    <p className="text-sm text-muted-foreground my-2">{persona.description}</p>
                    <div className="space-y-2">
                        {persona.recommendedPosts.map((post) => (
                            <div key={post.title} className="p-3 rounded-md bg-background hover:bg-muted/50 transition-colors">
                                <p className="text-sm font-medium">{post.title}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{post.tactic}</p>
                                <Button size="sm" variant="ghost" className="w-full justify-start h-auto p-1 mt-1 text-xs text-primary">이 글감으로 초고 생성 →</Button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);


// 메인 '전략 제련소' 컴포넌트
export default function StrategyForge({ strategyResult }: { strategyResult: StrategyResult }) {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(strategyResult.kosResults[0]?.keyword || null);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
      <ResizablePanel defaultSize={30} minSize={20}>
        <OracleOfOpportunity
          kosResults={strategyResult.kosResults}
          selectedKeyword={selectedKeyword}
          onSelectKeyword={setSelectedKeyword}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={40} minSize={30}>
        <LoomOfStructure
          pillarContent={strategyResult.pillarContent}
          topicClusters={strategyResult.topicClusters}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        <AnvilOfExecution personas={strategyResult.personas} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
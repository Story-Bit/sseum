'use client';

import { Button } from "@/components/ui/button";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChevronRight } from "lucide-react";
import Stage1_StrategyDraft from '@/components/stages/Stage1_StrategyDraft';
import Stage2_Refinement from '@/components/stages/Stage2_Refinement';
import Stage3_Publish from '@/components/stages/Stage3_Publish';
import { useBlogStore } from '@/components/stages/blog-store';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getPostsFromFirestore } from '@/firebase/post';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function EditorPage() {
    const { user, db } = useAuth(); // Get db from context
    const { loadPosts, setLoading, currentStage } = useBlogStore();
  
    useEffect(() => {
      // Ensure both user and db are available
      if (user && db) {
        const fetchPosts = async () => {
          setLoading(true, "데이터를 불러오는 중입니다...");
          try {
            // Pass db as the first argument
            const posts = await getPostsFromFirestore(db, user.uid);
            loadPosts(posts);
          } catch (error) {
            toast.error("데이터를 불러오는 데 실패했습니다.");
          } finally {
            setLoading(false);
          }
        };
        fetchPosts();
      }
    }, [user, db, loadPosts, setLoading]);

    const renderCurrentStage = () => {
        switch (currentStage) {
            case 'strategy':
                return <Stage1_StrategyDraft />;
            case 'refinement':
                return <Stage2_Refinement />;
            case 'publish':
                return <Stage3_Publish />;
            default:
                return <Stage1_StrategyDraft />;
        }
    }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
            {/* 좌측 사이드바 */}
            <div className="flex h-full flex-col p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button variant="outline">새 글 작성</Button>
                    <Button variant="outline">외부 글 가져오기</Button>
                    <Button variant="outline">글 저장하기</Button>
                    <Button variant="outline">글 불러오기</Button>
                </div>
                <div className="flex-grow">
                    <h3 className="text-sm font-semibold mb-2">작업 단계</h3>
                    <div className="space-y-1">
                        <Button variant="secondary" className="w-full justify-start">1. 전략 & 초고</Button>
                        <Button variant="ghost" className="w-full justify-start">2. AI 퇴고</Button>
                        <Button variant="ghost" className="w-full justify-start">3. 발행 & 활용</Button>
                    </div>
                </div>
                <div>
                    <Button variant="ghost" className="w-full justify-between">
                        나만의 글쓰기 스타일
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75} className="flex flex-col">
            {/* 중앙 콘텐츠 패널 */}
            {renderCurrentStage()}
        </ResizablePanel>
    </ResizablePanelGroup>
  );
}
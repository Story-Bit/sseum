'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getPostsFromFirestore } from '@/firebase/post';
import { useBlogStore } from '@/components/stages/blog-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FilePlus, Loader, X } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { useJourneyStore } from '@/components/stages/journeyStore';
import { ConstellationNavigator } from '@/components/ui/ConstellationNavigator';
import { Step1_Topic } from '@/components/stages/Step1_Topic';
import { Step2_StrategyAnalysis } from '@/components/stages/Step2_StrategyAnalysis';

// --- The Grand Stage Component (Rendered for the 'journey' view) ---
const GrandStage = ({ onExit }: { onExit: () => void }) => {
    const { currentStep, resetJourney } = useJourneyStore();

    const handleExit = () => {
        resetJourney();
        onExit();
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1_Topic />;
            case 2:
                return <Step2_StrategyAnalysis />;
            default:
                return <div>Step {currentStep}</div>;
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#F9F9F9] p-8 relative">
            <Button onClick={handleExit} variant="ghost" size="icon" className="absolute top-6 right-6 z-10">
                <X className="h-6 w-6" />
            </Button>
            <div className="absolute top-8 w-full flex justify-center">
                <ConstellationNavigator />
            </div>
            <AnimatePresence mode="wait">
                {renderCurrentStep()}
            </AnimatePresence>
        </div>
    );
};

// --- The Perfected Plaza of Inspiration Component ---
const PlazaOfInspiration = ({ onStartJourney }: { onStartJourney: () => void }) => {
    const { user, db } = useAuth();
    const { posts, loadPosts, setLoading, isLoading: isBlogLoading } = useBlogStore();

    useEffect(() => {
        if (user && db) {
            const fetchPosts = async () => {
                setLoading(true, "과거의 여정을 불러오는 중...");
                try {
                    const fetchedPosts = await getPostsFromFirestore(db, user.uid);
                    loadPosts(fetchedPosts);
                } catch (error) {
                    toast.error("과거 여정을 불러오는 데 실패했습니다.");
                } finally {
                    setLoading(false);
                }
            };
            fetchPosts();
        }
    }, [user, db, loadPosts, setLoading]);

    return (
        // This container uses flexbox to manage its children's sizes and prevent overflow.
        <div className="p-8 h-full flex flex-col">
            <header className="mb-8 flex-shrink-0">
                <h1 className="text-4xl font-bold text-harmony-indigo">영감의 광장</h1>
                <p className="text-xl text-harmony-indigo/70 mt-2">이곳에서 당신의 위대한 이야기가 시작됩니다.</p>
            </header>

            <div className="mb-8 flex-shrink-0">
                <Button size="lg" className="h-16 text-xl" onClick={onStartJourney}>
                    <FilePlus className="mr-4 h-8 w-8" />
                    새로운 글쓰기 여정 시작하기
                </Button>
            </div>

            <section className="flex-grow min-h-0">
                <h2 className="text-2xl font-bold text-harmony-indigo mb-4">과거의 여정들</h2>
                <div className="h-full overflow-y-auto"> {/* This inner div scrolls, not the whole page */}
                    {isBlogLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader className="h-8 w-8 animate-spin" />
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {posts.map((post) => (
                                <Card key={post.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle>{post.title}</CardTitle>
                                        <CardDescription>{post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toLocaleString() : '날짜 없음'}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {post.draft || "내용 없음"}
                                        </p>
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                        <Button className="w-full">이어서 작업하기</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center h-full flex flex-col justify-center items-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">아직 시작된 여정이 없습니다.</p>
                            <p className="text-sm text-muted-foreground mt-1">'새로운 글쓰기 여정'을 시작하여 첫 번째 걸작을 만들어보세요.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

// --- World Controller ---
export default function EditorPage() {
    const [view, setView] = useState<'plaza' | 'journey'>('plaza');

    if (view === 'journey') {
        return <GrandStage onExit={() => setView('plaza')} />;
    }

    return <PlazaOfInspiration onStartJourney={() => setView('journey')} />;
}
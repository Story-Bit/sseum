'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getPostsFromFirestore } from '@/firebase/post';
import { useBlogStore } from '@/components/stages/blog-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Loader } from 'lucide-react';
import { toast } from 'sonner';

import { AnimatePresence } from 'framer-motion';
import { useJourneyStore } from '@/components/stages/journeyStore';
import { ConstellationNavigator } from '@/components/ui/ConstellationNavigator';
import { Step1_Topic } from '@/components/stages/Step1_Topic';
import { Step2_StrategyAnalysis } from '@/components/stages/Step2_StrategyAnalysis';
import { X } from 'lucide-react';

// --- The Grand Stage Component (Phase 2) ---
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
            // Future steps will be added here
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
        <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-harmony-indigo">영감의 광장</h1>
                <p className="text-xl text-harmony-indigo/70 mt-2">이곳에서 당신의 위대한 이야기가 시작됩니다.</p>
            </header>

            <div className="mb-12">
                <Button size="lg" className="h-16 text-xl" onClick={onStartJourney}>
                    <FilePlus className="mr-4 h-8 w-8" />
                    새로운 글쓰기 여정 시작하기
                </Button>
            </div>

            <section>
                <h2 className="text-2xl font-bold text-harmony-indigo mb-6">과거의 여정들</h2>
                {isBlogLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader className="h-8 w-8 animate-spin" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Card key={post.id}>
                                <CardHeader>
                                    <CardTitle>{post.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {post.draft.substring(0, 100)}...
                                    </p>
                                    <Button variant="link" className="p-0 h-auto mt-4">
                                        이어서 작업하기
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">아직 시작된 여정이 없습니다.</p>
                        <p className="text-sm text-muted-foreground mt-1">'새로운 글쓰기 여정'을 시작하여 첫 번째 걸작을 만들어보세요.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default function EditorPage() {
    const [view, setView] = useState<'plaza' | 'journey'>('plaza');

    if (view === 'journey') {
        return <GrandStage onExit={() => setView('plaza')} />;
    }

    return <PlazaOfInspiration onStartJourney={() => setView('journey')} />;
}
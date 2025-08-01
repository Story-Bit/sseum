'use client';

import Stage1_StrategyDraft from '@/components/stages/Stage1_StrategyDraft';
import Stage2_Refinement from '@/components/stages/Stage2_Refinement';
import Stage3_Publish from '@/components/stages/Stage3_Publish';
import { useBlogStore } from '@/components/stages/blog-store';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getPostsFromFirestore } from '@/firebase/post';
import { toast } from 'sonner';

export default function EditorPage() {
    const { user } = useAuth();
    const { loadPosts, setLoading, currentStage } = useBlogStore();
  
    useEffect(() => {
      if (user) {
        const fetchPosts = async () => {
          setLoading(true, "데이터를 불러오는 중입니다...");
          try {
            const posts = await getPostsFromFirestore(user.uid);
            loadPosts(posts);
          } catch (error) {
            console.error("Failed to fetch posts:", error);
            toast.error("데이터를 불러오는 데 실패했습니다.");
          } finally {
            setLoading(false);
          }
        };
        fetchPosts();
      }
    }, [user, loadPosts, setLoading]);

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
        <div className="h-full">
            {renderCurrentStage()}
        </div>
    );
}
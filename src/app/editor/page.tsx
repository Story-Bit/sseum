'use client';

import Sidebar from '@/components/Sidebar';
// Editor 대신, 실제 존재하는 Stage2_Refinement를 가져옵니다.
import Stage2_Refinement from '@/components/stages/Stage2_Refinement';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useBlogStore } from '@/components/stages/blog-store';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getPostsFromFirestore } from '@/firebase/post';
import { toast } from 'sonner';

export default function EditorPage() {
    const { user } = useAuth();
    const { loadPosts, setLoading } = useBlogStore();
  
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

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-full rounded-lg border">
      <ResizablePanel defaultSize={20} minSize={15}>
        <Sidebar />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        {/* Editor 대신 Stage2_Refinement를 사용합니다. */}
        <Stage2_Refinement />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
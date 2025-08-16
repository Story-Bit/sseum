'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import PasteTextModal from '@/components/modals/PasteTextModal';
import LoadPostModal from '@/components/modals/LoadPostModal';
import AboutModal from '@/components/modals/AboutModal';
import { useModalStore } from '@/components/stages/modal-store';
import { useBlogStore } from '@/components/stages/blog-store';
import { toast } from 'sonner';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { modals, closeModal } = useModalStore();
  const { setActivePost, setCurrentStage } = useBlogStore();

  const handlePasteText = (pastedText: string) => {
    setActivePost({
      id: `temp-${Date.now()}`,
      title: pastedText.substring(0, 20).trim() || "붙여넣은 글",
      draft: pastedText,
    });
    setCurrentStage('refinement');
    closeModal('pasteText');
    toast.success("텍스트를 성공적으로 붙여넣었습니다. AI 퇴고를 시작하세요.");
  };

  return (
    <AuthGuard>
      <PasteTextModal
        isOpen={!!modals.pasteText}
        onClose={() => closeModal('pasteText')}
        onLoadText={handlePasteText}
      />
      <LoadPostModal
        isOpen={!!modals.loadPost}
        onClose={() => closeModal('loadPost')}
      />
      <AboutModal
        isOpen={!!modals.about}
        onClose={() => closeModal('about')}
      />
      
      <div className="flex h-screen">
        <Sidebar isSidebarOpen={true} />
        <main className="flex-grow min-h-0 ml-72 bg-slate-50 dark:bg-slate-900">
            {children}
        </main>
      </div>
    </AuthGuard>
  );
}
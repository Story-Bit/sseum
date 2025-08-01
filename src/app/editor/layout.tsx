// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useModalStore } from '@/stores/modal-store';
// blog-store에서 필요한 부품을 가져옵니다.
import { useBlogStore } from '@/components/stages/blog-store';
import PasteTextModal from '@/components/modals/PasteTextModal';
import LoadPostModal from '@/components/modals/LoadPostModal';
import AboutModal from '@/components/modals/AboutModal';
import StyleAnalyzerModal from '@/components/modals/StyleAnalyzerModal';
import Header from '@/components/Header';
import { toast } from 'sonner';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { modals, closeModal } = useModalStore();
  // setActivePost 함수를 중앙 기록 보관소에서 가져옵니다.
  const { setActivePost } = useBlogStore();

  // PasteTextModal에 전달할 함수를 제련합니다.
  const handlePasteText = (pastedText: string) => {
    setActivePost({
      id: `temp-${Date.now()}`,
      title: "붙여넣은 글",
      draft: pastedText,
    });
    closeModal('pasteText');
    toast.success("텍스트를 성공적으로 붙여넣었습니다.");
  };

  return (
    <AuthGuard>
      <PasteTextModal 
        isOpen={!!modals.pasteText}
        onClose={() => closeModal('pasteText')}
        // 제련한 함수를 onLoadText라는 도구로 전달합니다.
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
      <StyleAnalyzerModal
        isOpen={!!modals.styleAnalyzer}
        onClose={() => closeModal('styleAnalyzer')}
      />
      
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-black">
        <Header /> 
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import { useBlog } from '@/components/BlogContext';
import PasteTextModal from '@/components/modals/PasteTextModal';
import LoadPostModal from '@/components/modals/LoadPostModal';
import AboutModal from '@/components/modals/AboutModal';
import StyleAnalyzerModal from '@/components/modals/StyleAnalyzerModal';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { 
    isPasteModalOpen, setIsPasteModalOpen, handlePastePost, 
    isLoadModalOpen, setIsLoadModalOpen, handleLoadPost,
    isAboutModalOpen, setIsAboutModalOpen,
    isStyleModalOpen, setIsStyleModalOpen
  } = useBlog();

  return (
    <AuthGuard>
      <PasteTextModal 
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onLoadText={handlePastePost}
      />
      <LoadPostModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoadPost={handleLoadPost}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
      <StyleAnalyzerModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
      />
      <div className="flex h-screen bg-gray-50">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
          <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
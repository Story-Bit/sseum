'use client';

import React from 'react';
import { useBlog } from '@/components/BlogContext';
import Stage1_StrategyDraft from '@/components/stages/Stage1_StrategyDraft';
import Stage2_Refinement from '@/components/stages/Stage2_Refinement';

export default function EditorPage() {
  const { currentStage, activePost } = useBlog();

  // 현재 작업 단계에 따라 적절한 '방'을 보여줍니다.
  // 만약 선택된 글이 없다면, 항상 '전략실'을 보여줍니다.
  if (!activePost) {
    return <Stage1_StrategyDraft />;
  }

  switch (currentStage) {
    case 'strategy':
      return <Stage1_StrategyDraft />;
    case 'refinement':
      return <Stage2_Refinement />;
    case 'publish':
      return <div>발행실 (제작 예정)</div>;
    default:
      return <div>알 수 없는 단계입니다.</div>;
  }
}
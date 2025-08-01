'use client';

import Stage1_StrategyDraft from '@/components/stages/Stage1_StrategyDraft';
import Stage2_Refinement from '@/components/stages/Stage2_Refinement';
import Stage3_Publish from '@/components/stages/Stage3_Publish';
import { useBlogStore } from '@/components/stages/blog-store';

export default function EditorPage() {
    const { currentStage } = useBlogStore();

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

    // 이 페이지는 이제 오직 현재 작업 단계의 내용만 보여줍니다.
    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full">
            {renderCurrentStage()}
        </div>
    );
}
'use client';

import React, { useState, useCallback } from 'react';
import { useBlogStore } from '../blog-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader, Sparkles, Edit } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const ExpertPanel = () => {
    const { activePost, setActivePost, setLoading } = useBlogStore();
    const [holisticRequest, setHolisticRequest] = useState('');
    const [isRevising, setIsRevising] = useState(false);

    const handleHolisticRevision = useCallback(async () => {
        if (!holisticRequest.trim()) { toast.error("개선 요청사항을 입력해주세요."); return; }
        setIsRevising(true);
        setLoading(true, "편집장이 요청사항을 반영하여 글 전체를 재구성하고 있습니다...");
        try {
            const prompt = `<role>당신은 60년 경력의 전설적인 편집장입니다...</role><task>...</task>[원문]:\n${activePost?.draft}\n---[사용자 요청사항]:\n${holisticRequest}\n---`;
            // const newDraft = await callGenerativeAPI(prompt);
            const newDraft = `[${holisticRequest}] 요청에 따라 AI 편집장이 수정한 글입니다.`;
            setActivePost({ ...activePost!, draft: newDraft });
            setHolisticRequest('');
            toast.success("요청사항이 성공적으로 반영되었습니다!");
        } catch (e: any) {
            toast.error(`전체 개선 중 오류: ${e.message}`);
        } finally {
            setIsRevising(false);
            setLoading(false);
        }
    }, [activePost, holisticRequest, setActivePost, setLoading]);

    return (
        <div className="p-4 space-y-6">
            <div>
                <h3 className="font-bold text-gray-800 mb-2">편집장에게 직접 요청</h3>
                <p className="text-xs text-gray-500 mb-2">글의 톤, 구조, 흐름 등에 대한 개선 방향을 자유롭게 지시하면, 60년 경력의 편집장이 글 전체를 재구성합니다.</p>
                <Textarea value={holisticRequest} onChange={(e) => setHolisticRequest(e.target.value)} rows={5} className="w-full p-2 border rounded-lg" placeholder="예시: '전체적으로 더 전문적인 톤으로 바꿔주세요.'" disabled={isRevising} />
                <Button onClick={handleHolisticRevision} disabled={isRevising || !holisticRequest || !activePost} className="w-full mt-2">
                    {isRevising ? <Loader className="animate-spin mr-2" /> : <Edit size={16} className="mr-2" />}
                    {isRevising ? '전체 개선 중...' : '요청사항 전체 반영'}
                </Button>
            </div>
        </div>
    );
};

export default ExpertPanel;
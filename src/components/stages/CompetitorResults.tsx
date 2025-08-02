'use client';

// 1. { useState }를 괄호로 감싸 올바르게 가져옵니다.
import React, { useState } from 'react';
import { ArrowRight, Loader, Target, Award, CheckCircle } from 'lucide-react';
import { useBlogStore, PostType } from './blog-store';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { callGenerativeAPI } from '@/lib/gemini';
import { db } from '@/firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const savePost = async (userId: string, postData: Partial<PostType>): Promise<PostType> => {
  const postsCollectionRef = collection(db, `users/${userId}/posts`);
  if (postData.id && !postData.id.startsWith('temp-')) {
    const postRef = doc(db, `users/${userId}/posts`, postData.id);
    const updateData = { ...postData, updatedAt: serverTimestamp() };
    await updateDoc(postRef, updateData);
    return { ...postData, ...updateData } as PostType;
  } else {
    const newPostData = { ...postData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    delete newPostData.id;
    const docRef = await addDoc(postsCollectionRef, newPostData);
    return { ...newPostData, id: docRef.id } as PostType;
  }
};

// 2. result의 타입을 명확하게 정의하여 'any' 오류를 해결합니다.
interface CompetitorResultsProps {
  result: {
    content_gap: string[];
    new_outline: string;
    titles: string[];
  };
}

const CompetitorResults: React.FC<CompetitorResultsProps> = ({ result }) => {
  const { setActivePost, upsertPostInList, setLoading, setCurrentStage } = useBlogStore();
  const { user } = useAuth();
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<string | null>(null);

  const handleSelectAndGenerateDraft = async (title: string, outline: string) => {
    if (!user) {
      toast.error("초고를 생성하려면 로그인이 필요합니다.");
      return;
    }

    setIsGeneratingTitle(title);
    setLoading(true, "AI 작가가 전략적 목차에 따라 초고를 작성합니다...");

    try {
      const tempPost: Partial<PostType> = { title, strategyResult: { mainKeyword: title, outline } };
      const savedInitialPost = await savePost(user.uid, tempPost);

      const draftPrompt = `
<role>당신은 경쟁사의 글을 분석하여 그보다 뛰어난 글을 작성하는 최고의 블로그 작가입니다.</role>
<task>아래 <콘텐츠 지침>을 완벽히 준수하여, 경쟁사를 압도하는 고품질 블로그 포스트 초고를 한국어로 작성해주십시오.</task>
<strict_rules>
1.  **AI 정체성 숨기기**: 본문에 AI이거나, AI로서의 경력을 절대 언급하지 마십시오.
2.  **한국어 가독성 최적화**: 짧은 문장과 문단, 문장 리듬, 명시적 문맥 등 한국어 독자를 위한 글쓰기 원칙을 준수하십시오.
3.  **목차 완벽 준수**: 아래 제공된 [전략적 목차]의 구조와 내용을 반드시 충실하게 따르십시오.
</strict_rules>
<콘텐츠 지침>
- **주제**: ${title}
- **전략적 목차**: ${outline}
- **기본 구조**: '제목: ...' 형식으로 시작하며, 서론, 본론(소제목은 '##' 사용), 결론 순서로 작성하십시오.
</콘텐츠 지침>
---
[최종 초고 출력]:`;
      
      const fullText = await callGenerativeAPI(draftPrompt);
      
      const titleMatch = fullText.match(/^(제목|Title):\s*(.*)/im);
      const newTitle = titleMatch ? titleMatch[2] : title;
      const postContent = titleMatch ? fullText.substring(fullText.indexOf('\n') + 1).trim() : fullText;

      const finalPostData: PostType = {
        ...savedInitialPost,
        title: newTitle,
        draft: postContent,
      };
      const updatedPost = await savePost(user.uid, finalPostData);

      upsertPostInList(updatedPost);
      setActivePost(updatedPost);
      setCurrentStage('refinement');
      toast.success("경쟁사를 뛰어넘는 초고 생성 완료! 퇴고실로 이동합니다.");

    } catch (e: any) {
      toast.error(`초고 생성 중 오류: ${e.message}`);
    } finally {
      setIsGeneratingTitle(null);
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 grid md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-lg animate-fade-in">
      <div>
        <h4 className="font-semibold mb-3 text-red-600 flex items-center"><Target size={18} className="mr-2"/> AI의 공략 포인트 (콘텐츠 갭)</h4>
        <ul className="space-y-2 text-sm">
          {(result.content_gap || []).map((gap: string, i: number) => 
            <li key={i} className="flex items-start p-2 bg-red-50 rounded-md">
              <CheckCircle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0"/>
              <span>{gap}</span>
            </li>
          )}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-green-600 flex items-center"><Award size={18} className="mr-2"/> 추천 제목 선택 & 초고 생성</h4>
        <div className="space-y-2">
          {(result.titles || []).map((title: string) => (
            <button 
              key={title} 
              onClick={() => handleSelectAndGenerateDraft(title, result.new_outline)} 
              disabled={!!isGeneratingTitle}
              className="w-full text-left p-3 rounded-lg border bg-white hover:bg-green-50 text-sm transition-all flex items-center justify-between group disabled:opacity-50"
            >
              <span>{title}</span>
              {isGeneratingTitle === title ? 
                <Loader className="h-4 w-4 animate-spin flex-shrink-0 ml-2" /> : 
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorResults;
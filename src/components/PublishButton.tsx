'use client';

import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config'; // 가정된 Firebase 설정 파일 경로
import { Button } from '@/components/ui/button'; // shadcn/ui의 Button 컴포넌트 사용을 가정
import { Rocket, LoaderCircle } from 'lucide-react';

/**
 * PublishButton 컴포넌트의 Props 타입 정의
 * @param {string} appId - 애플리케이션 ID
 * @param {string} userId - 사용자 ID
 * @param {string} postId - 발행할 포스트의 ID
 * @param {boolean} initialIsPublished - 초기 발행 상태
 */
interface PublishButtonProps {
  appId: string;
  userId: string;
  postId: string;
  initialIsPublished?: boolean;
}

/**
 * Firestore에 문서 발행 상태를 업데이트하고 UI를 제어하는 버튼 컴포넌트.
 * 내부적으로 로딩 상태를 관리하여 중복 요청을 방지한다.
 */
export function PublishButton({ appId, userId, postId, initialIsPublished = false }: PublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(initialIsPublished);

  const handlePublish = async () => {
    if (!appId || !userId || !postId) {
      console.error('Publish Error: Missing required IDs.');
      return;
    }

    setIsPublishing(true);
    
    // Firestore 문서 경로 참조
    const postRef = doc(db, 'artifacts', appId, 'users', userId, 'posts', postId);

    try {
      // 'publishedAt' 필드를 현재 서버 시간으로 업데이트하고, 'isPublished' 상태를 true로 변경
      await updateDoc(postRef, {
        isPublished: true,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp() // 수정일도 함께 업데이트
      });
      setIsPublished(true);
    } catch (error) {
      console.error('Error updating document:', error);
      // 여기에 사용자에게 보여줄 에러 처리 로직을 추가할 수 있다 (e.g., toast message)
    } finally {
      setIsPublishing(false);
    }
  };
  
  // 이미 발행된 포스트는 버튼을 비활성화 처리
  if (isPublished) {
    return (
        <Button variant="outline" disabled>
            <Rocket className="mr-2 h-4 w-4" />
            발행 완료
        </Button>
    );
  }

  return (
    <Button onClick={handlePublish} disabled={isPublishing}>
      {isPublishing ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          발행 중...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-4 w-4" />
          발행하기
        </>
      )}
    </Button>
  );
}
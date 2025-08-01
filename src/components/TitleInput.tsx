// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

// 경로 약어('@') 대신, 파일의 실제 위치를 기준으로 한 상대 경로를 사용합니다.
import { useBlogStore } from '@/stores/blog-store'; 
import { Input } from './ui/input';

export default function TitleInput() {
  const { activePost, setActivePost } = useBlogStore();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activePost) return;
    setActivePost({ ...activePost, title: e.target.value });
  };

  return (
    <Input
      type="text"
      placeholder="매력적인 제목을 입력하세요..."
      value={activePost?.title || ''}
      onChange={handleTitleChange}
      className="text-2xl md:text-3xl font-bold border-none focus-visible:ring-0 shadow-none pl-0"
    />
  );
}
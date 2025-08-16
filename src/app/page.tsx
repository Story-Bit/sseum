// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

import { redirect } from 'next/navigation';

export default function HomePage() {
  // 사용자가 현관문('/')에 접근하면,
  // 즉시 에디터의 방('/editor')으로 보냅니다.
  redirect('/editor');

  // 따라서 이 아래 부분은 보이지 않습니다.
  return null;
}
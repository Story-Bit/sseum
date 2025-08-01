// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

import React from 'react';
import { useAuth } from './AuthContext';
// 1. 당신의 실제 설계도인 'firebase/config'에서 auth를 가져옵니다.
import { auth } from '../firebase/config';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
// 2. 당신의 설계도에 있는 './stages/modal-store' 경로를 사용합니다.
import { useModalStore } from './stages/modal-store';
import { toast } from 'sonner';

export default function Header() {
  const { user } = useAuth();
  const { openModal } = useModalStore();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("성공적으로 로그아웃되었습니다.");
      window.location.href = '/login';
    } catch (error) {
      console.error("Sign out error", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
      <div>
        <Button variant="outline" onClick={() => openModal('loadPost')}>
          글 불러오기
        </Button>
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm font-medium">{user.email}</span>}
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
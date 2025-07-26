'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

// children prop의 타입을 명시적으로 지정합니다.
interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { userId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이 아닐 때, 그리고 userId가 없을 때 (로그아웃 상태)
    if (!isLoading && !userId) {
      router.push('/login'); // 로그인 페이지로 리디렉션
    }
  }, [userId, isLoading, router]);

  // 인증 상태를 확인하는 동안 로딩 화면을 보여줍니다.
  if (isLoading) {
    return <div>Loading...</div>; // 또는 스피너 컴포넌트
  }

  // 로그인된 사용자에게만 자식 컴포넌트(실제 페이지)를 보여줍니다.
  if (userId) {
    return <>{children}</>;
  }

  // 리디렉션이 발생하기 전까지 아무것도 렌더링하지 않습니다.
  return null;
};

export default AuthGuard;
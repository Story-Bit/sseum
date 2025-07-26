'use client';

import React, { useEffect } from 'react'; // [수정 완료]
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export default function RootPage() {
  const { userId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (userId) {
        router.push('/editor');
      } else {
        router.push('/login');
      }
    }
  }, [userId, isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">불러오는 중...</p>
      </div>
    </div>
  );
}
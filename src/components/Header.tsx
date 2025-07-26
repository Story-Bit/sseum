'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { signOut } from 'firebase/auth';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const router = useRouter();
  const { user, auth, showToast } = useAuth();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      showToast('로그아웃 되었습니다.', 'info');
      // MainLayout이 상태 변화를 감지하여 자동으로 HomePage를 보여줄 것입니다.
    } catch (error) {
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-6">
        {/* 이 버튼은 사이드바가 있을 때만 의미가 있으므로, user가 있을 때만 렌더링합니다. */}
        {user && (
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
            <Menu />
          </button>
        )}
        
        {/* 오른쪽 영역 */}
        <div className="flex-1 flex justify-end">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">{user.email}</span>
              <button onClick={handleLogout} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                로그아웃
              </button>
            </div>
          ) : (
             <button onClick={() => router.push('/login')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
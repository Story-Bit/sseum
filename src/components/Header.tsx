'use client';

import React from 'react';
import { useAuth } from './AuthContext';
import { auth } from '@/firebase/config';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Button } from './ui/button';
import { LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("성공적으로 로그아웃되었습니다.");
      window.location.href = '/login';
    } catch (error) {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b h-16 flex-shrink-0">
      <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <Menu />
      </Button>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm font-medium">{user.email}</span>}
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
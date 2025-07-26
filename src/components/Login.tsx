'use client';

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // [삭제] setUser를 더 이상 여기서 사용하지 않습니다.

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // 로그인 성공 시 AuthContext가 자동으로 상태를 변경하므로 여기서 별도 작업이 필요 없습니다.
    } catch (err: any) {
      setError('로그인에 실패했습니다. 이메일 또는 비밀번호를 확인하세요.');
      console.error('Login Error:', err);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-sm rounded border p-8">
      <h2 className="mb-4 text-center text-2xl font-bold">로그인</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email">이메일</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full">
          로그인
        </Button>
      </form>
    </div>
  );
};
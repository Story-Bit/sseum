'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, Auth } from 'firebase/auth';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/components/AuthContext'; // 우리가 사용할 새로운 인증 컨텍스트

// --- SVG Icons ---
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303C33.973 32.082 29.418 35 24 35c-6.065 0-11-4.935-11-11s4.935-11 11-11c2.507 0 4.813.857 6.661 2.278l6.343-6.343C33.047 6.527 28.761 5 24 5 12.954 5 4 13.954 4 25s8.954 20 20 20c11.046 0 20-8.954 20-20 0-1.341-.138-2.651-.389-3.917z"/><path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 16.104 19.001 13 24 13c2.507 0 4.813.857 6.661 2.278l6.343-6.343C33.047 6.527 28.761 5 24 5c-6.627 0-12.31 3.438-15.694 8.691z"/><path fill="#FBBC05" d="M24 45c5.418 0 10.027-1.918 13.303-5.083l-6.143-5.034C29.418 35 24 35 24 35c-5.418 0-9.973-2.918-11.303-7.083l-6.143 5.034C11.69 41.562 17.373 45 24 45z"/><path fill="#EA4335" d="M43.611 20.083H42V20H24v8h11.303C33.973 32.082 29.418 35 24 35c-6.065 0-11-4.935-11-11s4.935-11 11-11c2.507 0 4.813.857 6.661 2.278l6.343-6.343C33.047 6.527 28.761 5 24 5 12.954 5 4 13.954 4 25s8.954 20 20 20c11.046 0 20-8.954 20-20 0-1.341-.138-2.651-.389-3.917z"/></g></svg>
);

export default function LoginPage() {
    const router = useRouter();
    const { auth, showToast } = useAuth(); // AuthContext에서 auth 인스턴스와 showToast 함수를 가져옵니다.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) {
            showToast('인증 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.', 'error');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast('회원가입이 완료되었습니다! 자동으로 로그인됩니다.', 'success');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showToast('로그인 되었습니다. 환영합니다!', 'success');
            }
            router.push('/'); // 성공 시 메인 에디터 페이지로 이동
        } catch (err: any) {
            const friendlyMessage = err.code === 'auth/invalid-credential' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            setError(friendlyMessage);
            showToast(friendlyMessage, 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSocialLogin = async () => {
        if (!auth) {
            showToast('인증 시스템이 준비되지 않았습니다.', 'error');
            return;
        }
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            showToast('Google 계정으로 로그인되었습니다. 환영합니다!', 'success');
            router.push('/');
        } catch (err: any) {
            showToast('소셜 로그인 중 오류가 발생했습니다.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-slate-100 font-sans p-4">
            <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center text-white bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-center">
                    <Sparkles className="h-16 w-16 text-yellow-300 mb-4" />
                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">씀<span className="text-yellow-300">.</span></h1>
                    <p className="text-lg leading-relaxed opacity-90">생각을 기록하고, 지식을 나누는 공간<br/>지금 <span className="font-bold text-yellow-200">씀.</span>과 함께 시작하세요.</p>
                </div>
                <div className="w-full md:w-1/2 p-8 sm:p-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">{isSignUp ? '씀.에 가입하기' : '다시 오신 것을 환영합니다'}</h2>
                    <p className="text-slate-500 mb-8">{isSignUp ? '몇 단계만 거치면 씀.의 회원이 될 수 있습니다.' : '계속하려면 로그인하세요.'}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email" placeholder="이메일 주소"
                                className="w-full border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none py-3 pl-10 pr-4 text-slate-800 transition-colors bg-transparent"
                                value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password" placeholder="비밀번호"
                                className="w-full border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none py-3 pl-10 pr-4 text-slate-800 transition-colors bg-transparent"
                                value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
                            />
                        </div>
                        {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</div>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
                            disabled={loading}
                        >
                            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
                        </button>
                    </form>
                    <div className="flex items-center my-8">
                        <hr className="flex-grow border-slate-200"/>
                        <span className="mx-4 text-sm font-medium text-slate-400">또는</span>
                        <hr className="flex-grow border-slate-200"/>
                    </div>
                    <div className="space-y-3">
                        <button
                            className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-lg px-3 py-3 hover:bg-slate-50 transition-colors duration-300 disabled:opacity-50"
                            onClick={handleSocialLogin} disabled={loading} type="button"
                        >
                            <GoogleIcon />
                            <span className="font-semibold text-slate-700">Google 계정으로 계속하기</span>
                        </button>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-slate-500">
                            {isSignUp ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}
                            <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-blue-600 hover:underline ml-2" disabled={loading}>
                                {isSignUp ? '로그인' : '회원가입'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
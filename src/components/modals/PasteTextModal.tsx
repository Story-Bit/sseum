'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, UploadCloud } from 'lucide-react';

interface PasteTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadText: (text: string) => void;
}

const PasteTextModal: React.FC<PasteTextModalProps> = ({ isOpen, onClose, onLoadText }) => {
    const [text, setText] = useState('');

    if (!isOpen) return null;

    const handleLoad = () => {
        if (!text.trim()) return;
        onLoadText(text);
        setText('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">외부 글 가져오기</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-4">다른 곳에서 작성한 글을 붙여넣고, 바로 AI 퇴고를 시작하세요.</p>
                    <Textarea 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="이곳에 글 전문을 붙여넣어 주세요..." 
                        className="w-full h-64 p-3 border rounded-lg" 
                    />
                </div>
                <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end">
                    <Button onClick={handleLoad}>
                        <UploadCloud className="mr-2 h-4 w-4" /> 불러와서 퇴고 시작
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PasteTextModal;
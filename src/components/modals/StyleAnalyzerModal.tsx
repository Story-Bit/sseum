'use client';

import React, { useState, useEffect } from 'react';
import { X, Wand2, Loader, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { callGenerativeAPI } from '@/lib/gemini';

interface StyleAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StyleAnalyzerModal: React.FC<StyleAnalyzerModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useAuth();
  const [userStyleText, setUserStyleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedStyle, setSavedStyle] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const storedStyle = localStorage.getItem('userStyleGuide');
        if (storedStyle) setSavedStyle(storedStyle);
      } catch (e) {
        console.error("localStorage 접근 오류:", e);
      }
    }
  }, [isOpen]);

  const handleAnalyzeStyle = async () => {
    if (!userStyleText.trim()) {
      showToast('분석할 텍스트를 입력해주세요.', 'error');
      return;
    }
    setIsAnalyzing(true);
    const prompt = `너는 문체 분석 전문가야. 다음 텍스트를 분석해서 이 글의 핵심적인 스타일 특징(톤, 자주 쓰는 어휘, 문장 구조, 독특한 습관 등)을 다른 AI가 모방할 수 있도록 간결한 '스타일 가이드' 형식으로 요약해 줘. 분석할 텍스트: """${userStyleText}"""`;
    const schema = { type: "OBJECT", properties: { style_guide: { type: "STRING" } }, required: ["style_guide"] };

    try {
      const result = await callGenerativeAPI(prompt, schema);
      if (result.style_guide) {
        localStorage.setItem('userStyleGuide', result.style_guide);
        setSavedStyle(result.style_guide);
        setUserStyleText('');
        showToast('나만의 스타일 분석 및 저장이 완료되었습니다!', 'success');
      } else {
        throw new Error("API 응답에서 스타일 가이드를 찾을 수 없습니다.");
      }
    } catch (e: any) {
      showToast(`스타일 분석 중 오류가 발생했습니다: ${e.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearStyle = () => {
    localStorage.removeItem('userStyleGuide');
    setSavedStyle(null);
    showToast('저장된 스타일이 초기화되었습니다.', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 animate-modal-pop">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center"><Wand2 className="mr-2 text-blue-500"/>나만의 글쓰기 스타일 분석</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1"><X /></button>
        </div>
        <div className="p-6">
          {savedStyle ? (
            <div>
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md mb-4 font-semibold">✅ 스타일이 저장되어 모든 AI 작업에 자동으로 적용됩니다.</p>
              <p className="text-sm text-gray-600 bg-gray-100 p-4 rounded-md mb-4 h-40 overflow-y-auto">"{savedStyle}"</p>
              <button onClick={handleClearStyle} className="w-full bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center">
                <Trash2 size={16} className="mr-2"/> 저장된 스타일 초기화
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">대표적인 글 1개를 붙여넣으면, AI가 스타일을 분석하여 모든 초고 생성 및 퇴고에 반영합니다.</p>
              <textarea 
                value={userStyleText} 
                onChange={(e) => setUserStyleText(e.target.value)} 
                rows={8} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow" 
                placeholder="여기에 대표적인 블로그 글 1개의 전체 본문을 붙여넣으세요..." 
                disabled={isAnalyzing} 
              />
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={handleAnalyzeStyle} 
                  disabled={isAnalyzing || !userStyleText.trim()} 
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader className="animate-spin mr-2" /> : <Wand2 className="mr-2"/>} 스타일 분석 및 저장
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleAnalyzerModal;
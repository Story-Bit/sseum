'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface AnalysisData {
  structure: string;
  keywords: string;
}

const CrystalBall = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);

  const handleAnalyze = async () => {
    if (!url.startsWith('http')) {
      toast.error('올바른 URL 형식을 입력해주십시오.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    const toastId = toast.loading('경쟁자의 갑옷을 분석 중...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '분석에 실패했습니다.');
      }

      setResult(data);
      toast.success('분석 완료!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-8 rounded-lg border border-dashed border-gray-400 p-6">
      <h2 className="mt-0 text-xl font-bold">🔮 수정 구슬: 경쟁자 분석</h2>
      <div className="flex gap-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="분석할 경쟁자의 URL을 입력..."
          className="flex-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button onClick={handleAnalyze} disabled={isLoading} className="rounded-lg bg-gray-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-gray-700 disabled:opacity-50">
          {isLoading ? '분석중...' : '분석 실행'}
        </button>
      </div>

      {result && (
        <div className="mt-6 flex flex-col gap-8 md:flex-row">
          <div className="flex-1">
            <h3 className="font-semibold">콘텐츠 구조</h3>
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-gray-100 p-4 text-sm">{result.structure}</pre>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">핵심 키워드</h3>
            <p className="mt-2 text-gray-700">{result.keywords}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrystalBall;
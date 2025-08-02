'use client';

import { toast } from 'sonner';

// [강화] API 호출에 '인내의 한계'(타임아웃)를 설정합니다.
export const callGenerativeAPI = async (prompt: string, schema: any = null, timeout = 30000): Promise<any> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, schema }),
      signal: controller.signal, // 타임아웃 신호를 연결합니다.
    });
    
    clearTimeout(id); // 성공 시 타임아웃을 해제합니다.

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API 서버 오류: ${response.status}`);
    }
    const data = await response.json();
    return data.result;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('AI의 응답 시간이 너무 깁니다. 잠시 후 다시 시도해주세요.');
    }
    console.error("API 호출 오류:", error);
    throw error;
  }
};

// 긴 텍스트를 위한 '신탁 분할 제련술'
export const callChunkedAPI = async (
    fullText: string,
    mapPromptTemplate: (chunk: string) => string,
    reducePrompt: (summaries: string) => string,
    schema: any,
    chunkSize: number = 5000
) => {
    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
        chunks.push(fullText.substring(i, i + chunkSize));
    }

    toast.info(`글을 ${chunks.length}개의 조각으로 나누어 분석을 시작합니다...`);

    const summaryPromises = chunks.map(chunk => {
        const mapPrompt = mapPromptTemplate(chunk);
        return callGenerativeAPI(mapPrompt);
    });

    const summaries = await Promise.all(summaryPromises);
    const combinedSummary = summaries.join("\n\n---\n\n");
    
    toast.info(`분석된 조각들을 종합하여 최종 전략을 도출합니다...`);
    return callGenerativeAPI(reducePrompt(combinedSummary), schema);
};
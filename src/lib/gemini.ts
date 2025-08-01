import { toast } from 'sonner';

// 짧은 텍스트용 API 호출 함수
export const callGenerativeAPI = async (prompt: string, schema: any = null): Promise<any> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, schema }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API 서버 오류: ${response.status}`);
    }
    const data = await response.json();
    return data.result;
  } catch (error: any) {
    console.error("API 호출 오류:", error);
    // 오류를 다시 던져서 호출한 쪽에서 최종적으로 처리하게 합니다.
    throw error;
  }
};

// 긴 텍스트를 위한 분할 정복 API 호출 함수
export const callChunkedAPI = async (
    fullText: string,
    mapPromptTemplate: (chunk: string) => string,
    reducePrompt: (summaries: string) => string,
    schema: any,
    chunkSize: number = 5000 // 텍스트를 분할할 글자 수를 정의합니다.
) => {
    // 1단계: 원석 분할
    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
        chunks.push(fullText.substring(i, i + chunkSize));
    }

    toast.info(`글을 ${chunks.length}개의 조각으로 나누어 분석을 시작합니다...`);

    // 2단계: 개별 제련 (Map)
    const summaryPromises = chunks.map(chunk => {
        const mapPrompt = mapPromptTemplate(chunk);
        // 요약 단계에서는 JSON 스키마를 사용하지 않습니다.
        return callGenerativeAPI(mapPrompt);
    });

    const summaries = await Promise.all(summaryPromises);
    const combinedSummary = summaries.join("\n\n---\n\n");
    
    toast.info(`분석된 조각들을 종합하여 최종 전략을 도출합니다...`);
    
    // 3단계: 최종 제련 (Reduce)
    return callGenerativeAPI(reducePrompt(combinedSummary), schema);
};
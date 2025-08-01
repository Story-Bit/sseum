import { toast } from 'sonner';

// 클라이언트에서 서버 API를 호출하는 함수
export const callGenerativeAPI = async (prompt: string, schema: any = null) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, schema }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API 서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.result; // 서버 API는 'result' 키에 최종 결과를 담아 반환합니다.

  } catch (error: any) {
    console.error("API 호출 오류:", error);
    toast.error(error.message);
    // 오류가 발생했을 때 null 대신 오류를 다시 던져서 호출한 쪽에서 처리하게 합니다.
    throw error;
  }
};
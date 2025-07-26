// [추가] 생성할 콘텐츠의 종류를 정의하는 타입
export type GenerationType = 'thumbnail' | 'bodyImage' | 'social' | 'video' | 'dataFinder' | 'internalLinks';

const withKoreanEngine = (originalPrompt: string): string => {
    const engineInstruction = `
<system_instruction>
당신은 한국어 처리에 고도로 최-적화된 AI입니다. 사용자의 요청을 처리하기에 앞서, 한국어의 교착어적 특성과 토큰화 문제를 고려하여, 의미는 완벽히 보존하면서 LLM이 가장 효율적이고 정확하게 이해할 수 있도록 내부적으로 프롬프트를 재구성하고 분석하는 과정을 거치십시오. 그 후에, 아래의 원래 임무를 수행하십시오.
</system_instruction>
---
`;
    return engineInstruction + originalPrompt;
};

export async function callGenerativeAPI(prompt: string, schema: any = null): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const enhancedPrompt = withKoreanEngine(prompt);
    
    const payload: any = {
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
            temperature: 0.7,
        }
    };
    
    if (schema) {
        payload.generationConfig.responseMimeType = "application/json";
        payload.generationConfig.responseSchema = schema;
    }

    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API 오류: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();

    if (result.promptFeedback?.blockReason) {
        throw new Error(`API 요청이 안전 정책에 의해 차단되었습니다: ${result.promptFeedback.blockReason}`);
    }

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rawText = result.candidates[0].content.parts[0].text;
        if (schema) {
            try {
                const jsonString = rawText.replace(/^```json\s*|```\s*$/g, '');
                return JSON.parse(jsonString);
            } catch (e) {
                console.error("JSON 파싱 실패:", e, "원본 텍스트:", rawText);
                throw new Error(`API 응답이 유효한 JSON 형식이 아닙니다.`);
            }
        }
        return rawText;
    } else {
        throw new Error("API로부터 유효한 응답을 받지 못했습니다.");
    }
}
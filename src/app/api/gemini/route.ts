import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY가 .env.local 파일에 설정되지 않았습니다.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const withKoreanEngine = (originalPrompt: string): string => {
    const engineInstruction = `<system_instruction>당신은 한국어 처리에 고도로 최적화된 AI입니다. 사용자의 요청을 처리하기에 앞서, 한국어의 교착어적 특성과 토큰화 문제를 고려하여, 의미는 완벽히 보존하면서 LLM이 가장 효율적이고 정확하게 이해할 수 있도록 내부적으로 프롬프트를 재구성하고 분석하는 과정을 거치십시오. 그 후에, 아래의 원래 임무를 수행하십시오.</system_instruction>---`;
    return `${engineInstruction}\n${originalPrompt}`;
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, schema } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: '요청에 프롬프트가 누락되었습니다.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", safetySettings });
    const enhancedPrompt = withKoreanEngine(prompt);

    const generationConfig: any = {
        temperature: 0.7,
        maxOutputTokens: 8192,
    };

    if (schema) {
        generationConfig.responseMimeType = "application/json";
        generationConfig.responseSchema = schema;
    }

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
        generationConfig,
    });
    
    const responseText = result.response.text();
    
    // 스키마가 있을 경우 JSON으로 파싱하여 반환합니다.
    const finalResult = schema ? JSON.parse(responseText) : responseText;

    return NextResponse.json({ result: finalResult });

  } catch (error: any) {
    console.error("Gemini API Error in Route:", error);
    return NextResponse.json({ error: error.message || '내부 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
// /src/app/api/gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { StrategyResult } from '@/types/strategy';

// 신탁소(API) 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 기본 안전 설정 (이지스 프로토콜의 일부)
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// 신탁 정제 제련술: 텍스트 원석에서 JSON 보석을 추출하는 제련기
const parseJsonFromText = (text: string): any | null => {
  // AI가 Markdown 코드 블록으로 JSON을 반환하는 경우에 대비
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  const jsonString = match ? match[1] : text;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON 파싱 실패:", error);
    console.error("파싱 실패 원본 텍스트:", jsonString);
    // 파싱 실패는 치명적 오류이므로, null을 반환하여 호출부에서 처리하도록 함
    return null;
  }
};

// [신설] 전략 분석 임무를 위한 프롬프트 생성기
const createStrategyPrompt = (mainKeyword: string, blogType: string): string[] => {
  const systemPrompt = `
    당신은 15년차 SEO 전략 전문가이자 콘텐츠 마케팅의 대가입니다.
    당신의 임무는 주어진 주제에 대해 SEO 잠재력을 분석하고, 완벽한 콘텐츠 전략을 수립하는 것입니다.
    결과는 반드시, 오직, 무조건 아래의 JSON 형식으로만 응답해야 합니다. 다른 부가 설명이나 서론, 결론을 절대 추가하지 마십시오.

    {
      "kosResults": [{ "keyword": "string", "kosScore": "number", "explanation": "string" }],
      "pillarContent": "string",
      "topicClusters": [{ "mainTopic": "string", "subTopics": ["string"] }],
      "personas": [{ "name": "string", "description": "string", "recommendedPosts": [{ "title": "string", "tactic": "string" }] }]
    }
  `;
  const userPrompt = `
    - 주제: ${mainKeyword}
    - 블로그 유형: ${blogType}
    - 위 정보를 바탕으로 SEO 전략을 분석하고, 시스템 프롬프트에 명시된 JSON 형식으로 결과를 반환하시오.
  `;
  return [systemPrompt, userPrompt];
};

export async function POST(req: NextRequest) {
  try {
    // [개선] 임무 유형(task)과 데이터(payload)를 받아 처리하도록 구조 변경
    const { task, payload } = await req.json();

    if (!task || !payload) {
      return NextResponse.json({ error: '잘못된 요청 형식입니다. task와 payload가 필요합니다.' }, { status: 400 });
    }

    let prompts: string[];
    let generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain", // 기본값은 text
    };
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest", safetySettings });

    // 임무 유형에 따라 분기 처리
    switch (task) {
      case 'generateStrategy':
        const { mainKeyword, blogType } = payload;
        if (!mainKeyword || !blogType) {
          return NextResponse.json({ error: '전략 생성을 위한 필수 데이터가 누락되었습니다.' }, { status: 400 });
        }
        prompts = createStrategyPrompt(mainKeyword, blogType);
        // 전략 분석은 항상 JSON을 반환해야 함
        generationConfig.responseMimeType = "application/json";
        break;

      case 'generateText':
        const { prompt: textPrompt } = payload;
        if (!textPrompt) {
          return NextResponse.json({ error: '텍스트 생성을 위한 프롬프트가 누락되었습니다.' }, { status: 400 });
        }
        prompts = [textPrompt];
        break;

      // 향후 다른 임무(예: 'refineText', 'generateImage')를 위한 case 추가 가능
      default:
        return NextResponse.json({ error: `알 수 없는 임무 유형입니다: ${task}` }, { status: 400 });
    }

    const result = await model.generateContent({
        contents: prompts.map(p => ({ role: "user", parts: [{ text: p }] })),
        generationConfig,
    });
    
    const responseText = result.response.text();

    // [중요] 전략 분석 임무의 결과물은 JSON 정제 과정을 거침
    if (task === 'generateStrategy') {
      const strategyResult = parseJsonFromText(responseText);
      if (!strategyResult) {
        throw new Error('API로부터 유효한 전략 데이터(JSON)를 수신하지 못했습니다.');
      }
      return NextResponse.json(strategyResult);
    }
    
    // 그 외 텍스트 임무는 원본 텍스트를 그대로 반환
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    // 이지스 프로토콜: 최종 방어 체계
    console.error(`신탁소(API) 오류 발생:`, error);
    return NextResponse.json(
      { error: error.message || '신탁소(API)에서 알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
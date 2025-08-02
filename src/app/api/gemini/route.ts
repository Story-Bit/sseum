// /src/app/api/gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 신탁소(API) 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const parseJsonFromText = (text: string): any | null => {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  const jsonString = match ? match[1] : text;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON 파싱 실패:", error);
    return null;
  }
};

const createStrategyPrompt = (mainKeyword: string, blogType: string): string => {
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
  return `${systemPrompt}\n\n---\n\n${userPrompt}`;
};

export async function POST(req: NextRequest) {
  try {
    // [수정] 더 이상 task를 받지 않고, 필요한 데이터를 직접 받는다.
    const { mainKeyword, blogType } = await req.json();

    if (!mainKeyword || !blogType) {
      return NextResponse.json({ error: '필수 데이터(mainKeyword, blogType)가 누락되었습니다.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest", safetySettings });
    const prompt = createStrategyPrompt(mainKeyword, blogType);

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        },
    });

    const responseText = result.response.text();
    const strategyResult = parseJsonFromText(responseText);

    if (!strategyResult) {
      throw new Error('API로부터 유효한 전략 데이터(JSON)를 수신하지 못했습니다.');
    }
    
    return NextResponse.json(strategyResult);

  } catch (error: any) {
    console.error(`신탁소(API) 오류 발생:`, error);
    return NextResponse.json(
      { error: error.message || '신탁소(API)에서 알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
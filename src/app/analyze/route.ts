// /src/app/api/gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 신탁소 초기화 및 설정 (이전과 동일)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  safetySettings: [ /* ... 안전 설정 ... */ ],
  generationConfig: { responseMimeType: "application/json" }
});
const parseJsonFromText = (text: string): any => { /* ... JSON 추출 로직 ... */ };

// 프롬프트 생성기 업그레이드
const createPrompt = (task: string, payload: any): string => {
  const systemPrompt = `당신은 네이버의 C-Rank와 D.I.A.+ 알고리즘에 통달한 15년차 SEO 전략가이자, 한국어의 미묘한 뉘앙스를 완벽하게 이해하는 전문 카피라이터입니다. 모든 답변은 지시에 따라 정확한 JSON 형식으로만 제공해야 합니다.`;
  const naverSeoRules = `\n\n[규칙]\n1. 제목: 핵심 키워드를 맨 앞에 포함하고, 32자 이내로 간결하게 작성.\n2. 구조: 명확한 '서론-본론-결론' 구조.\n3. 키워드: 핵심 키워드를 본문에 3~7회 자연스럽게 반복.\n4. 독창성 (D.I.A.+): 실제 경험 기반의 독창적 정보 제공.\n5. 어조: '해요체' 사용.\n\n[출력 형식]\n{"title": "string", "content": "string"}`;

  switch (task) {
    case 'analyzeKeywords':
      return `${systemPrompt}\n\n주제 '${payload.mainKeyword}'에 대한 KOS(키워드 기회 점수)가 높은 순서대로 5개를 아래 JSON 구조로 반환하시오.\n\n{"kosResults": [{"keyword": "string", "kosScore": "number", "explanation": "string"}]}`;
    
    case 'generateStrategyDetails':
      return `${systemPrompt}\n\n키워드 '${payload.selectedKeyword}'를 중심으로, 주제적 권위를 구축하기 위한 콘텐츠 전략을 아래 JSON 구조로 제안하시오.\n\n{"pillarContent": "string", "topicClusters": [{"mainTopic": "string", "subTopics": ["string"]}], "personas": [{"name": "string", "description": "string", "recommendedPosts": [{"title": "string", "tactic": "string"}]}]}`;

    case 'generatePillarPost':
      return `${systemPrompt}\n\n'${payload.selectedKeyword}' 키워드에 대한 종합 필러 콘텐츠 초고를 생성하시오. 다음 전략을 참고하시오: "${payload.pillarContentStrategy}". ${naverSeoRules}`;
    
    // [명령 2] 클러스터 포스트 생성 임무 추가
    case 'generateClusterPost':
      return `${systemPrompt}\n\n'${payload.mainKeyword}'라는 대주제 안에서, '${payload.subTopic}'이라는 소주제에 대한 블로그 초고를 생성하시오. ${naverSeoRules}`;

    // [명령 1] 페르소나 포스트 생성 임무 추가
    case 'generatePersonaPost':
      return `${systemPrompt}\n\n'${payload.personaName}'라는 타겟 독자를 위해, '${payload.title}'라는 제목의 블로그 초고를 생성하시오. 다음 공략 비급을 반드시 반영하시오: "${payload.tactic}". ${naverSeoRules}`;

    default:
      throw new Error(`알 수 없는 임무입니다: ${task}`);
  }
};

// API 라우트 핸들러 (이전과 동일)
export async function POST(req: NextRequest) {
  try {
    const { task, payload } = await req.json();
    const prompt = createPrompt(task, payload);
    const result = await model.generateContent(prompt);
    const responseJson = parseJsonFromText(result.response.text());
    return NextResponse.json(responseJson);
  } catch (error: any) {
    console.error(`신탁소 오류 (임무: ${req.url}):`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
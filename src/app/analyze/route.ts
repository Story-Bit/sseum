// /src/app/api/gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 타입 정의
interface KOSResult { keyword: string; kosScore: number; explanation: string; }
interface TopicCluster { mainTopic: string; subTopics: string[]; }
interface Persona { name: string; description: string; recommendedPosts: { title: string; tactic: string; }[]; }
interface StrategyDetails { pillarContent: string; topicClusters: TopicCluster[]; personas: Persona[]; }
interface BlogPost { title: string; content: string; }

// 신탁소 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    // ... (기타 안전 설정)
  ],
  generationConfig: { responseMimeType: "application/json" }
});


// JSON 추출기
const parseJsonFromText = (text: string): any => {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  try {
    return JSON.parse(match ? match[1] : text);
  } catch (e) {
    console.error("JSON 파싱 실패:", text);
    throw new Error("AI로부터 유효한 JSON 응답을 받지 못했습니다.");
  }
};

// [명령 3 & 4] 한국어 및 네이버 SEO 최적화 프롬프트 생성기
const createPrompt = (task: string, payload: any): string => {
  // 기본 역할 부여: AI에게 네이버 SEO 전문가 페르소나를 부여 [cite: 78, 265]
  let systemPrompt = `당신은 네이버의 C-Rank와 D.I.A.+ 알고리즘에 통달한 15년차 SEO 전략가이자, 한국어의 미묘한 뉘앙스를 완벽하게 이해하는 전문 카피라이터입니다. [cite: 233, 245, 34] 모든 답변은 지시에 따라 정확한 JSON 형식으로만 제공해야 합니다.`;

  switch (task) {
    case 'analyzeKeywords':
      return `${systemPrompt}\n\n주제 '${payload.mainKeyword}'에 대한 연관 키워드를 분석하여, 아래 JSON 구조에 맞춰 KOS(키워드 기회 점수)가 높은 순서대로 5개를 반환하시오. 각 키워드에 대한 설명은 네이버 블로그 공략 관점에서 구체적으로 제시하시오.\n\n{"kosResults": [{"keyword": "string", "kosScore": "number", "explanation": "string"}]}`;
    
    case 'generateStrategyDetails':
      return `${systemPrompt}\n\n선택된 키워드 '${payload.selectedKeyword}'를 중심으로, 네이버 블로그의 주제적 권위(Topical Authority)를 구축하기 위한 콘텐츠 전략을 아래 JSON 구조로 제안하시오. [cite: 296]\n\n{"pillarContent": "string (필러 콘텐츠의 핵심 전략)", "topicClusters": [{"mainTopic": "string", "subTopics": ["string"]}], "personas": [{"name": "string (타겟 독자)", "description": "string", "recommendedPosts": [{"title": "string (추천 글감)", "tactic": "string (AI 공략 비급)"}]}]}`;

    case 'generatePillarPost':
      // [명령 4] 네이버 SEO 규칙을 프롬프트에 직접 주입
      return `${systemPrompt}\n\n당신은 이제 블로그 글을 작성합니다. 아래의 엄격한 규칙을 반드시 준수하여, '${payload.selectedKeyword}' 키워드에 대한 필러 콘텐츠 초고를 생성하시오. 이 과정은 최종 퇴고(Stage2)의 토큰 소모를 최소화하기 위함입니다. [cite: 314]\n\n[규칙]\n1. 제목: 핵심 키워드 '${payload.selectedKeyword}'를 맨 앞에 포함하고, 총 32자 이내로 간결하게 작성. [cite: 316]\n2. 구조: 명확한 '서론-본론-결론' 구조를 따를 것. [cite: 320]\n3. 키워드: 핵심 키워드를 본문에 3~7회 자연스럽게 반복하고, 연관 키워드를 다양하게 사용할 것. [cite: 318, 319]\n4. 독창성 (D.I.A.+): 실제 경험을 바탕으로 쓴 것처럼 독창적이고 깊이 있는 정보를 제공. [cite: 248]\n5. 어조 (경어법): 독자에게 친근하게 설명하는 '해요체'를 사용할 것. [cite: 44, 45]\n\n[전략]\n${payload.pillarContentStrategy}\n\n[출력 형식]\n{"title": "string (규칙에 맞는 제목)", "content": "string (규칙에 맞춰 생성된 블로그 본문)"}`;

    default:
      throw new Error("알 수 없는 임무입니다.");
  }
};

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
// /src/app/api/gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 타입 정의 (안정적인 운영을 위해)
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
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
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

// 프롬프트 생성기
const createPrompt = (task: string, payload: any): string => {
  let systemPrompt = `당신은 네이버의 C-Rank와 D.I.A.+ 알고리즘에 통달한 15년차 SEO 전략가이자, 한국어의 미묘한 뉘앙스를 완벽하게 이해하는 전문 카피라이터입니다. 모든 답변은 지시에 따라 정확한 JSON 형식으로만 제공해야 합니다.`;

  switch (task) {
    case 'analyzeKeywords':
      return `${systemPrompt}\n\n주제 '${payload.mainKeyword}'와 블로그 유형 '${payload.blogType}'에 대한 연관 키워드를 분석하여, KOS(키워드 기회 점수)가 높은 순서대로 5개를 아래 JSON 구조로 반환하시오.\n\n{"kosResults": [{"keyword": "string", "kosScore": "number", "explanation": "string"}]}`;
    
    case 'generateStrategyDetails':
      return `${systemPrompt}\n\n선택된 키워드 '${payload.selectedKeyword}'를 중심으로, 주제적 권위를 구축하기 위한 콘텐츠 전략을 아래 JSON 구조로 제안하시오.\n\n{"pillarContent": "string", "topicClusters": [{"mainTopic": "string", "subTopics": ["string"]}], "personas": [{"name": "string", "description": "string", "recommendedPosts": [{"title": "string", "tactic": "string"}]}]}`;

    case 'generatePillarPost':
      return `${systemPrompt}\n\n아래의 엄격한 규칙을 준수하여, '${payload.selectedKeyword}' 키워드에 대한 필러 콘텐츠 초고를 생성하시오.\n\n[규칙]\n1. 제목: 핵심 키워드 '${payload.selectedKeyword}'를 맨 앞에 포함하고, 32자 이내로 작성.\n2. 구조: 명확한 '서론-본론-결론' 구조.\n3. 키워드: 핵심 키워드를 본문에 3~7회 자연스럽게 반복.\n4. 독창성 (D.I.A.+): 실제 경험 기반의 독창적 정보 제공.\n5. 어조: '해요체' 사용.\n\n[전략]\n${payload.pillarContentStrategy}\n\n[출력 형식]\n{"title": "string", "content": "string"}`;

    default:
      throw new Error(`알 수 없는 임무입니다: ${task}`);
  }
};

export async function POST(req: NextRequest) {
  try {
    const { task, payload } = await req.json();
    if (!task || !payload) {
      throw new Error("요청에 'task'와 'payload'가 필요합니다.");
    }
    
    const prompt = createPrompt(task, payload);
    const result = await model.generateContent(prompt);
    const responseJson = parseJsonFromText(result.response.text());

    return NextResponse.json(responseJson);

  } catch (error: any) {
    console.error(`신탁소 오류:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
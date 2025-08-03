// /src/app/api/gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 신탁소 초기화 및 설정
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

const parseJsonFromText = (text: string): any => {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  try {
    return JSON.parse(match ? match[1] : text);
  } catch (e) {
    console.error("JSON 파싱 실패:", text);
    throw new Error("AI로부터 유효한 JSON 응답을 받지 못했습니다.");
  }
};

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
    case 'generateClusterPost':
      return `${systemPrompt}\n\n'${payload.mainKeyword}'라는 대주제 안에서, '${payload.subTopic}'이라는 소주제에 대한 블로그 초고를 생성하시오. ${naverSeoRules}`;
    case 'generatePersonaPost':
      return `${systemPrompt}\n\n'${payload.personaName}'라는 타겟 독자를 위해, '${payload.title}'라는 제목의 블로그 초고를 생성하시오. 다음 공략 비급을 반드시 반영하시오: "${payload.tactic}". ${naverSeoRules}`;
    case 'analyzeCompetitor':
      return `${systemPrompt}\n\n입력된 경쟁사 블로그 본문을 네이버 SEO 관점에서 분석하고, 이 글을 이기기 위한 전략을 아래 JSON 구조로 제안하시오. '콘텐츠 갭' 즉, 기존 글의 약점과 누락된 정보를 파고드는 전략을 중심으로 제안해야 합니다.\n\n[경쟁사 본문]\n${payload.competitorContent}\n\n[출력 형식]\n{"analysis": "string (경쟁사 글의 강점, 약점, 핵심 콘텐츠 갭 분석)", "suggestedTitles": ["string (더 매력적이고 강력한 추천 제목 3개)"], "suggestedOutline": "string (콘텐츠 갭을 채우고 승리하기 위한 전략적 목차)"}`;
    default:
      throw new Error(`알 수 없는 임무입니다: ${task}`);
  }
};

export async function POST(req: NextRequest) {
  try {
    const { task, payload } = await req.json();
    if (!task || !payload) throw new Error("요청에 'task'와 'payload'가 필요합니다.");
    const prompt = createPrompt(task, payload);
    const result = await model.generateContent(prompt);
    const responseJson = parseJsonFromText(result.response.text());
    return NextResponse.json(responseJson);
  } catch (error: any) {
    console.error(`신탁소 오류:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
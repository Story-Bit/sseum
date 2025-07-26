import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// API 키를 서버 환경에서 안전하게 가져옵니다.
// .env.local 파일에 GEMINI_API_KEY="YOUR_KEY" 형식으로 저장해야 합니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 한국어 처리 엔진 프롬프트
const withKoreanEngine = (originalPrompt: string): string => {
    return `
<system_instruction>
당신은 한국어 처리에 고도로 최적화된 AI입니다. 사용자의 요청을 처리하기에 앞서, 한국어의 교착어적 특성과 토큰화 문제를 고려하여, 의미는 완벽히 보존하면서 LLM이 가장 효율적이고 정확하게 이해할 수 있도록 내부적으로 프롬프트를 재구성하고 분석하는 과정을 거치십시오. 그 후에, 아래의 원래 임무를 수행하십시오.
</system_instruction>
---
${originalPrompt}`;
};

export async function POST(request: Request) {
  try {
    // [수정] req-uest -> request 로 오타를 수정합니다.
    const { type, text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '요청에 필요한 텍스트가 없습니다.' }, { status: 400 });
    }

    let prompt = "";
    switch (type) {
      case 'GENERATE_DRAFT':
        prompt = `다음 주제에 대해 서론, 본론, 결론을 갖춘 500자 내외의 블로그 초고를 작성해주세요.\n\n주제: "${text}"`;
        break;
      case 'REVISE_MYTHICAL':
        prompt = `다음 글을 전설적인 편집장의 시선으로, 문장 구조, 어휘, 흐름을 완벽하게 다듬어 '신화' 등급의 명작으로 재창조해주세요.\n\n원고:\n"""${text}"""`;
        break;
      case 'SUGGEST_KEYWORDS':
        prompt = `다음 글의 핵심 주제와 관련된 SEO 키워드를 5개 추천해주세요. 쉼표로 구분된 목록 형식으로만 응답해야 합니다.\n\n글: "${text}"`;
        break;
      default:
        return NextResponse.json({ error: '알 수 없는 요청 유형입니다.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = withKoreanEngine(prompt);
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiText = response.text();

    return NextResponse.json({ result: aiText });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'AI 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
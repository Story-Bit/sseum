// 이 파일의 기존 내용을 모두 삭제하고 아래 코드를 붙여넣어라.

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// .env.local에 봉인된 비밀(API 키)을 여기서만 사용한다.
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하십시오.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// 이 설정은 AI가 유해한 콘텐츠를 생성할 가능성을 낮추는 안전장치다.
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// 이 함수가 외부 세계와 통신하는 왕국의 유일한 관문이다.
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: '요청에 프롬프트가 누락되었습니다.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings,
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    // 클라이언트에게는 내부 오류라는 것만 알린다. 상세 내용은 서버 로그에만 남긴다.
    return NextResponse.json({ error: '내부 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
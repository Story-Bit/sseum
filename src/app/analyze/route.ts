// /src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { SYSTEM_PROMPTS } from '@/constants/prompts'; // '@/'는 src 폴더를 가리키는 절대 경로입니다.
import { GoogleGenerativeAI } from "@google/generative-ai";

type AnalysisResult = {
  structure: string;
  keywords: string;
};

// Gemini 통신 로직을 이 파일 안에 통합하여 복잡성을 줄입니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function analyzeContent(text: string): Promise<string> {
    const systemPrompt = SYSTEM_PROMPTS.EXTRACT_STRUCTURE_AND_KEYWORDS;
    const finalPrompt = `${systemPrompt}\n\n## 입력:\n${text}`;
    const result = await model.generateContent(finalPrompt);
    return result.response.text();
}


// POST 요청만 처리하는 함수
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const pageResponse = await fetch(url);
    const html = await pageResponse.text();

    const $ = cheerio.load(html);
    $('script, style, nav, footer, aside').remove();
    const mainText = $('body').text().replace(/\s\s+/g, ' ').trim();

    if (mainText.length < 100) {
      return NextResponse.json({ error: '콘텐츠가 너무 짧아 분석할 수 없습니다.' }, { status: 400 });
    }

    const analysisRaw = await analyzeContent(mainText.substring(0, 8000));
    const analysisResult: AnalysisResult = JSON.parse(analysisRaw);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
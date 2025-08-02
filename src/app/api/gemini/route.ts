import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { throw new Error("GEMINI_API_KEY가 .env.local 파일에 설정되지 않았습니다."); }

const genAI = new GoogleGenerativeAI(API_KEY);
const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const refineTextToJson = async (rawText: string, schema: any, retries = 3): Promise<any> => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `<role>데이터 처리기</role><task>[원문 텍스트]를 분석하여, [JSON 스키마]에 맞춰 완벽한 JSON 객체로 변환하라.</task><rules>- 최종 결과는 오직 순수한 JSON 객체여야 한다.</rules>\n---\n[원문 텍스트]:\n${rawText}\n---\n[JSON 스키마]:\n${JSON.stringify(schema)}`;
    
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.1 }
            });
            return JSON.parse(result.response.text());
        } catch (error: any) {
            console.warn(`[제련소] ${i + 1}차 시도 실패. 남은 시도: ${retries - 1 - i}`);
            if (i === retries - 1) {
                console.error("[제련소] 최종 제련 실패:", error);
                throw new Error("AI가 보낸 응답이 반복적으로 손상되어 복원할 수 없습니다.");
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    throw new Error("AI 응답 제련에 최종적으로 실패했습니다.");
};

const divineSieve = (rawText: string, keyword: string): string[] => {
    const regex = new RegExp(`(?=${keyword}\\s*\\d*[:.])`, "g");
    const parts = rawText.split(regex).filter(p => p.trim().length > 0);
    return parts;
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, schema } = await req.json();
    if (!prompt) return NextResponse.json({ error: '프롬프트가 누락되었습니다.' }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", safetySettings });
    
    console.log("1단계: 외부 신에게 텍스트 원석 채굴을 요청합니다...");
    const initialResult = await model.generateContent(prompt);
    const rawText = initialResult.response.text();
    console.log("원석 채굴 완료.");

    if (!schema) return NextResponse.json({ result: rawText });
    
    if (schema.type === "OBJECT" && schema.properties) {
        console.log("미세 제련술 가동: 복잡한 배열 구조 감지.");
        const finalResult: { [key: string]: any } = {};

        for (const key in schema.properties) {
            const prop = schema.properties[key];
            if (prop.type === "ARRAY" && prop.items?.type === "OBJECT") {
                console.log(`2단계: '${key}' 항목에 대한 신성한 체 가동...`);
                const sieveKeyword = key === 'personas' ? '페르소나' : '키워드'; 
                const textAtoms = divineSieve(rawText, sieveKeyword);

                if(textAtoms.length === 0) {
                    console.warn(`신성한 체가 '${key}'에 대한 원석 조각을 찾지 못했습니다. 원본 텍스트로 단일 제련을 시도합니다.`);
                    const refinedItems = await refineTextToJson(rawText, schema);
                    return NextResponse.json({ result: refinedItems });
                }

                console.log(`3단계: ${textAtoms.length}개의 원석 조각을 개별 제련합니다.`);
                const refinedItems = [];
                for (const atom of textAtoms) {
                    const refinedItem = await refineTextToJson(atom, prop.items);
                    refinedItems.push(refinedItem);
                }
                
                finalResult[key] = refinedItems;
                console.log(`'${key}' 항목 제련 완료.`);
            } else {
                 const singleItemSchema = {type: "OBJECT", properties: {[key]: prop}};
                 const refinedItem = await refineTextToJson(rawText, singleItemSchema);
                 finalResult[key] = refinedItem[key];
            }
        }
        return NextResponse.json({ result: finalResult });
    }
    
    const finalResult = await refineTextToJson(rawText, schema);
    return NextResponse.json({ result: finalResult });

  } catch (error: any) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json({ error: error.message || '내부 서버 오류' }, { status: 500 });
  }
}
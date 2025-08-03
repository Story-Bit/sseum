// /src/app/api/strategies/route.ts

import { NextRequest, NextResponse } from 'next/server';
// TODO: Firebase Admin SDK 및 사용자 인증 로직 import 필요
// import { adminDb } from '@/lib/firebase-admin'; 
// import { getAuth } from 'firebase-admin/auth';

export async function POST(req: NextRequest) {
    try {
        // [중요] 실제 구현 시, 요청 헤더의 토큰을 통해 사용자를 인증해야 한다.
        // const { uid } = await verifyAuthToken(req);
        const uid = 'test-user-id'; // 임시 사용자 ID

        const { mainKeyword, kosResults, strategyDetails, id } = await req.json();
        if (!mainKeyword || !kosResults || !strategyDetails) {
            return NextResponse.json({ error: '저장에 필요한 데이터가 누락되었습니다.' }, { status: 400 });
        }

        const strategyData = {
            mainKeyword,
            kosResults,
            strategyDetails,
            updatedAt: new Date().toISOString(), // admin.firestore.FieldValue.serverTimestamp() 사용 권장
        };

        const strategyRef = null; // adminDb.collection('users').doc(uid).collection('strategies');

        let strategyId = id;
        if (strategyId) {
            // 기존 전략 업데이트
            // await strategyRef.doc(strategyId).update(strategyData);
            console.log(`전략 업데이트: ${strategyId}`, strategyData);
        } else {
            // 새로운 전략 저장
            // const newDoc = await strategyRef.add({ ...strategyData, createdAt: new Date().toISOString() });
            // strategyId = newDoc.id;
            strategyId = `new-strategy-${Date.now()}`; // 임시 ID 생성
            console.log(`신규 전략 저장: ${strategyId}`, strategyData);
        }

        return NextResponse.json({ success: true, id: strategyId });

    } catch (error: any) {
        console.error("전략 저장 API 오류:", error);
        return NextResponse.json({ error: "전략 저장 중 서버 오류 발생" }, { status: 500 });
    }
}
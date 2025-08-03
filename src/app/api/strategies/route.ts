// /src/app/api/strategies/route.ts

import { NextRequest, NextResponse } from 'next/server';
// [중요] 실제 프로덕션 환경에서는 아래 주석 처리된 부분을 활성화하여
// Firebase Admin SDK와 사용자 인증 로직을 완벽하게 구현해야 한다.
// import { adminDb } from '@/lib/firebase-admin';
// import { getAuthFromRequest } from '@/lib/auth'; // 가정: 요청에서 사용자 인증 정보를 추출하는 헬퍼 함수

// 임시 데이터베이스 역할
const tempDb: { [key: string]: any } = {};

export async function POST(req: NextRequest) {
    try {
        // const { uid } = await getAuthFromRequest(req);
        const uid = 'test-user-id'; // 임시 사용자 ID

        const { mainKeyword, kosResults, strategyDetails, id } = await req.json();
        if (!mainKeyword || !kosResults || !strategyDetails) {
            return NextResponse.json({ error: '저장에 필요한 데이터가 누락되었습니다.' }, { status: 400 });
        }

        const strategyData = { mainKeyword, kosResults, strategyDetails, updatedAt: new Date().toISOString() };
        
        let strategyId = id || `strategy-${Date.now()}`;
        
        // 임시 DB에 저장
        if (!tempDb[uid]) tempDb[uid] = {};
        tempDb[uid][strategyId] = { ...strategyData, id: strategyId };
        
        // Firestore 로직 (프로덕션용)
        // const userStrategiesRef = adminDb.collection('users').doc(uid).collection('strategies');
        // if (id) {
        //     await userStrategiesRef.doc(id).set(strategyData, { merge: true });
        // } else {
        //     const newDocRef = await userStrategiesRef.add({ ...strategyData, createdAt: new Date().toISOString() });
        //     strategyId = newDocRef.id;
        // }

        return NextResponse.json({ success: true, id: strategyId });
    } catch (error: any) {
        return NextResponse.json({ error: "전략 저장 중 서버 오류 발생" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // const { uid } = await getAuthFromRequest(req);
        const uid = 'test-user-id'; // 임시 사용자 ID

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        // 임시 DB 로직
        const userStrategies = tempDb[uid] || {};

        if (id) {
            // 특정 전략 상세 정보 불러오기
            const strategy = userStrategies[id];
            if (!strategy) return NextResponse.json({ error: "전략을 찾을 수 없습니다." }, { status: 404 });
            return NextResponse.json(strategy);
        } else {
            // 저장된 모든 전략 목록 불러오기
            const strategiesList = Object.values(userStrategies).map((s: any) => ({
                id: s.id,
                mainKeyword: s.mainKeyword,
                updatedAt: s.updatedAt,
            })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            return NextResponse.json(strategiesList);
        }

    } catch (error: any) {
        return NextResponse.json({ error: "전략 불러오기 중 서버 오류 발생" }, { status: 500 });
    }
}
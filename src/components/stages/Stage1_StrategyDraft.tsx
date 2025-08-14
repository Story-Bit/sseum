// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState, useEffect, FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { JourneyProgressBar } from '@/components/ui/JourneyProgressBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Swords, ArrowLeft, Rocket, Library, Users, Target, Save, FolderClock, Trash2, RefreshCw, Edit } from 'lucide-react';
import { toast } from "sonner";
import { useJourneyStore, FullStrategyData, CompetitorAnalysisResult } from './journeyStore';

// --- 단계별 화면 컴포넌트 ---
const animationProps = { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -300, opacity: 0 }, transition: { duration: 0.3 }};

const StepSelectPath: FC = () => {
    const { nextStep, setStrategyMode, setStep, setStrategyResult, savedStrategies, setSavedStrategies, removeSavedStrategy, setLoading } = useJourneyStore();
    useEffect(() => {
        const fetchSavedStrategies = async () => { try { const res = await fetch('/api/strategies'); if (!res.ok) throw new Error('저장된 목록 로딩 실패'); setSavedStrategies(await res.json()); } catch (err: any) { toast.error(err.message); }};
        fetchSavedStrategies();
    }, [setSavedStrategies]);
    const handleSelectMode = (mode: 'new' | 'competitor') => { setStrategyMode(mode); nextStep(); };
    const handleLoadStrategy = async (strategyId: string) => { setLoading(true); const toastId = toast.loading("저장된 전략을 불러오는 중입니다..."); try { const res = await fetch(`/api/strategies?id=${strategyId}`); if (!res.ok) throw new Error('전략을 불러오지 못했습니다.'); setStrategyResult(await res.json()); setStep(3); toast.success("전략을 성공적으로 불러왔습니다.", { id: toastId }); } catch (err: any) { toast.error(err.message, { id: toastId });} finally { setLoading(false); }};
    const handleDeleteStrategy = async (strategyId: string, strategyName: string) => { if (!window.confirm(`'${strategyName}' 전략을 정말로 삭제하시겠습니까?`)) return; const toastId = toast.loading(`'${strategyName}' 전략을 삭제하는 중...`); try { const res = await fetch(`/api/strategies?id=${strategyId}`, { method: 'DELETE' }); if (!res.ok) throw new Error((await res.json()).error || "전략 삭제 실패"); removeSavedStrategy(strategyId); toast.success("전략이 성공적으로 삭제되었습니다.", { id: toastId }); } catch (err: any) { toast.error(`오류: ${err.message}`, { id: toastId }); }};
    return (
        <motion.div key="step1" {...animationProps} className="w-full max-w-xl">
            <h1 className="text-3xl font-bold text-center text-harmony-indigo">시작해볼까요?</h1>
            <p className="text-center text-lg mt-2 text-harmony-indigo/70">어떤 방식으로 글쓰기의 여정을 떠나볼까요?</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-32 text-lg bg-white/50" onClick={() => handleSelectMode('new')}><FileText className="mr-2"/>새 아이디어로 시작</Button>
                <Button variant="outline" className="h-32 text-lg bg-white/50" onClick={() => handleSelectMode('competitor')}><Swords className="mr-2"/>경쟁사 분석으로 시작</Button>
            </div>
            <Card className="mt-8 bg-white/50"><CardHeader><CardTitle className="flex items-center"><FolderClock className="mr-2"/>기억의 회랑: 저장된 전략</CardTitle></CardHeader><CardContent>{savedStrategies.length > 0 ? (<ul className="space-y-2">{savedStrategies.map(s => (<li key={s.id} className="flex items-center space-x-2"><Button variant="outline" className="flex-grow justify-between" onClick={() => handleLoadStrategy(s.id)}><span>{s.mainKeyword}</span><span className="text-xs text-muted-foreground">{new Date(s.updatedAt).toLocaleString()}</span></Button><Button variant="destructive" size="icon" onClick={() => handleDeleteStrategy(s.id, s.mainKeyword)}><Trash2 className="h-4 w-4"/></Button></li>))}</ul>) : (<p className="text-sm text-center text-muted-foreground">저장된 전략이 없습니다.</p>)}</CardContent></Card>
        </motion.div>
    );
};

const StepEnterData: FC = () => {
    const { nextStep, strategyMode, mainKeyword, setMainKeyword, setLoading, setStrategyResult, setCompetitorResult, reset } = useJourneyStore();
    const [competitorContent, setCompetitorContent] = useState('');
    const handleAnalysis = async () => {
        const isNewMode = strategyMode === 'new';
        if (isNewMode && !mainKeyword.trim()) return toast.error("주제를 입력해야 합니다.");
        if (!isNewMode && !competitorContent.trim()) return toast.error("경쟁사 글을 입력해야 합니다.");
        setLoading(true);
        const toastId = toast.loading("AI가 분석을 시작했습니다...");
        try {
            const task = isNewMode ? 'analyzeKeywords' : 'analyzeCompetitor';
            const payload = isNewMode ? { mainKeyword } : { competitorContent };
            const res = await fetch('/api/gemini', { method: 'POST', body: JSON.stringify({ task, payload }), headers: { 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error((await res.json()).error);
            const data = await res.json();
            if(isNewMode) {
                const initialData: FullStrategyData = { mainKeyword, kosResults: data.kosResults, strategyDetails: null };
                setStrategyResult(initialData);
            } else {
                setCompetitorResult(data);
            }
            toast.success("분석 완료! 멋진 결과예요.", { id: toastId });
            nextStep();
        } catch (err: any) { toast.error(`오류 발생: ${err.message}`, { id: toastId }); reset(); }
        finally { setLoading(false); }
    };
    return (
        <motion.div key="step2" {...animationProps} className="w-full max-w-lg">
            <h1 className="text-3xl font-bold text-center text-harmony-indigo">{strategyMode === 'new' ? "멋진 선택이에요! 어떤 주제에 대해 글을 쓸까요?" : "적을 알아야 이길 수 있죠. 경쟁자의 글을 알려주세요."}</h1>
            <div className="mt-8">
                {strategyMode === 'new' ? (<Input placeholder="예: 제미나이 API" className="text-center text-xl h-14" value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}/>) 
                : (<Textarea placeholder="경쟁사의 글 본문을 여기에 붙여넣으세요." className="h-48 text-base" value={competitorContent} onChange={(e) => setCompetitorContent(e.target.value)} />)}
                <Button className="w-full mt-4 bg-inspiration-gold text-harmony-indigo text-lg h-12" onClick={handleAnalysis}>좋아요, 분석해주세요!</Button>
            </div>
        </motion.div>
    );
};

// --- New Step 3: KOS Selection ---
const StepShowKOS: FC = () => {
    const { strategyResult, setStrategyResult, nextStep } = useJourneyStore();
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [manualKeywordInput, setManualKeywordInput] = useState('');
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    if (!strategyResult) return <motion.div className="text-center">전략 결과를 불러오는 중...</motion.div>;

    const handleKeywordSelect = async (keyword: string) => {
        if (!keyword.trim() || isDetailLoading) return;
        setSelectedKeyword(keyword);
        setIsDetailLoading(true);
        const toastId = toast.loading(`'${keyword}'에 대한 상세 전략을 생성 중입니다...`);
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'generateStrategyDetails', payload: { selectedKeyword: keyword } }) });
            if (!res.ok) throw new Error((await res.json()).error);
            const details = await res.json();
            setStrategyResult({ ...strategyResult, strategyDetails: details });
            toast.success("상세 전략 생성 완료!", { id: toastId });
            nextStep();
        } catch (err: any) {
            toast.error(`상세 전략 로딩 오류: ${err.message}`, { id: toastId });
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleReanalyzeKOS = async () => {
        setIsReanalyzing(true);
        const toastId = toast.loading("AI가 다른 기회를 탐색 중입니다...");
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'analyzeKeywords', payload: { mainKeyword: strategyResult.mainKeyword } }) });
            if (!res.ok) throw new Error((await res.json()).error);
            const data = await res.json();
            setStrategyResult({ ...strategyResult, kosResults: data.kosResults, strategyDetails: null });
            toast.success("새로운 기회 분석 완료!", { id: toastId });
        } catch (err: any) {
            toast.error(`오류: ${err.message}`, { id: toastId });
        } finally {
            setIsReanalyzing(false);
        }
    };

    return (
        <motion.div key="step3_kos" {...animationProps} className="w-full max-w-5xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <h1 className="text-3xl font-bold text-harmony-indigo">기회의 신탁: 어떤 가능성을 탐색할까요?</h1>
                <Button variant="outline" onClick={handleReanalyzeKOS} disabled={isReanalyzing || isDetailLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
                    다른 기회 탐색
                </Button>
            </div>
             <div className="bg-white/80 border border-interaction-gray-200 rounded-lg p-6 flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {strategyResult.kosResults.map((item) => (
                        <Card key={item.keyword} onClick={() => handleKeywordSelect(item.keyword)} className={`p-4 cursor-pointer transition-all ${selectedKeyword === item.keyword ? 'border-primary ring-2 ring-primary shadow-xl' : 'hover:shadow-md'}`}>
                            <div className="flex justify-between">
                                <h3 className="font-bold text-lg">{item.keyword}</h3>
                                <Badge>{item.kosScore}점</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{item.explanation}</p>
                            {isDetailLoading && selectedKeyword === item.keyword && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                        </Card>
                    ))}
                </div>
                <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                    <h4 className="flex items-center font-semibold mb-2"><Edit className="mr-2 h-4 w-4" />수동 경로 개척</h4>
                    <div className="flex space-x-2">
                        <Input placeholder="직접 키워드 입력..." value={manualKeywordInput} onChange={(e) => setManualKeywordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleKeywordSelect(manualKeywordInput)} />
                        <Button onClick={() => handleKeywordSelect(manualKeywordInput)} disabled={isDetailLoading}>분석</Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- New Step 4: Strategy Details ---
const StepShowStrategyDetails: FC = () => {
    const { strategyResult, setStrategyResult } = useJourneyStore();
    const [activeTab, setActiveTab] = useState<'structure' | 'execution'>('structure');

    if (!strategyResult || !strategyResult.strategyDetails) return <motion.div className="text-center">전략 상세 정보를 불러오는 중...</motion.div>;

    const handleGeneratePost = async (task: string, payload: object, description: string) => { const toastId = toast.loading(`${description} 초고를 생성 중입니다...`); try { const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, payload }) }); if (!res.ok) throw new Error((await res.json()).error); const post = await res.json(); console.log("생성된 초고:", post); toast.success("초고 생성이 완료되었습니다!", { id: toastId }); } catch (err: any) { toast.error(`초고 생성 오류: ${err.message}`, { id: toastId }); }};

    const handleSaveStrategy = async () => {
        const toastId = toast.loading("전략을 저장하는 중...");
        try {
            const res = await fetch('/api/strategies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(strategyResult) });
            if (!res.ok) throw new Error((await res.json()).error);
            const { id } = await res.json();
            setStrategyResult({ ...strategyResult, id });
            toast.success("전략이 성공적으로 저장/업데이트되었습니다!", { id: toastId });
        } catch (err: any) {
            toast.error(`전략 저장 오류: ${err.message}`, { id: toastId });
        }
    };

    return (
        <motion.div key="step4_details" {...animationProps} className="w-full max-w-5xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold text-harmony-indigo">전략 완성: 이제 글감을 구체화하세요.</h1>
                <Button onClick={handleSaveStrategy}><Save className="mr-2 h-4 w-4" />{strategyResult.id ? '전략 업데이트' : '이 전략 저장'}</Button>
            </div>
            <div className="flex-grow flex flex-col bg-white/80 border border-interaction-gray-200 rounded-lg">
                <div className="flex border-b">
                    <button onClick={() => setActiveTab('structure')} className={`flex-1 p-4 text-lg font-semibold flex items-center justify-center ${activeTab === 'structure' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}><Library className="mr-2"/>구조의 베틀</button>
                    <button onClick={() => setActiveTab('execution')} className={`flex-1 p-4 text-lg font-semibold flex items-center justify-center ${activeTab === 'execution' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}><Users className="mr-2"/>실행의 모루</button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {activeTab === 'structure' && (
                        <section>
                            <div className="space-y-4">{strategyResult.strategyDetails.topicClusters.map(c => <div key={c.mainTopic} className="p-4 border rounded-lg"><h4 className="font-medium text-lg mb-3">{c.mainTopic}</h4><div className="flex flex-wrap gap-2">{c.subTopics.map((st) => (<Button key={st} variant="outline" size="sm" onClick={() => handleGeneratePost('generateClusterPost', { mainKeyword: strategyResult.mainKeyword, subTopic: st }, `'${st}'`)}>{st} 초고 생성</Button>))}</div></div>)}</div>
                        </section>
                    )}
                    {activeTab === 'execution' && (
                         <section>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{strategyResult.strategyDetails.personas.map((p, idx) => (<Card key={p.name}><CardHeader><h3 className="flex font-bold text-lg">{idx === 0 && <Target className="mr-2 h-5 w-5" />}핵심 타겟: {p.name}</h3><CardDescription>{p.description}</CardDescription></CardHeader><CardContent className="flex-grow space-y-3">{p.recommendedPosts.map((post) => (<div key={post.title} className="p-3 border rounded-md"><p className="font-medium">{post.title}</p><p className="text-sm text-blue-600 mt-1">{post.tactic}</p><Button size="sm" variant="ghost" className="w-full justify-start text-primary" onClick={() => handleGeneratePost('generatePersonaPost', { personaName: p.name, ...post }, `'${post.title}'`)}>초고 생성 →</Button></div>))}</CardContent></Card>))}</div>
                        </section>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const CompetitorResultDisplay: FC<{ competitorResult: CompetitorAnalysisResult }> = ({ competitorResult }) => {
    const { reset } = useJourneyStore();
    return (
         <motion.div key="competitorResult" {...animationProps} className="w-full max-w-4xl h-full">
            <Button variant="ghost" onClick={reset} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />새로운 분석 시작</Button>
            <h1 className="text-3xl font-bold text-center text-harmony-indigo mb-8">경쟁자 분석이 완료되었습니다.</h1>
            <div className="bg-white/80 border border-interaction-gray-200 rounded-lg p-6 h-[calc(100vh-220px)] overflow-y-auto">
                 <Card>
                    <CardHeader><CardTitle>경쟁사 분석 및 공략법</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div><h3 className="font-semibold text-lg mb-2">핵심 분석 및 콘텐츠 갭</h3><p className="text-muted-foreground whitespace-pre-wrap">{competitorResult.analysis}</p></div>
                        <div><h3 className="font-semibold text-lg mb-2">추천 제목</h3><ul className="list-disc list-inside space-y-1">{competitorResult.suggestedTitles.map(title => <li key={title}>{title}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg mb-2">추천 목차</h3><p className="text-muted-foreground whitespace-pre-wrap">{competitorResult.suggestedOutline}</p></div>
                        <Button className="w-full">이 전략으로 초고 생성</Button>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

// --- 메인 제어실 ---
export default function Stage1_StrategyDraft() {
  const { step, totalSteps, isLoading, prevStep, reset, strategyMode, competitorResult } = useJourneyStore();

  const renderStep = () => {
    switch(step) {
      case 1: return <StepSelectPath />;
      case 2: return <StepEnterData />;
      case 3:
        if (strategyMode === 'competitor') {
            return competitorResult ? <CompetitorResultDisplay competitorResult={competitorResult} /> : <div className="text-center">경쟁사 분석 결과를 불러오는 중...</div>;
        }
        return <StepShowKOS />;
      case 4:
        return <StepShowStrategyDetails />;
      default: return <StepSelectPath />;
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-8 bg-warm-white relative overflow-hidden">
      <JourneyProgressBar currentStep={step} totalSteps={totalSteps} />
      <Button variant="ghost" onClick={reset} className="absolute top-8 right-8 text-harmony-indigo/70">초기화</Button>
      {step > 1 && !isLoading && (
        <Button variant="ghost" onClick={prevStep} className="absolute top-8 left-8 text-harmony-indigo/70"><ArrowLeft className="mr-2 h-4 w-4" />이전</Button>
      )}
      <AnimatePresence mode="wait">
        {isLoading ? <Loader2 className="h-16 w-16 animate-spin text-inspiration-gold" /> : renderStep()}
      </AnimatePresence>
    </div>
  );
}
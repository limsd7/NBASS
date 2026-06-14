import React from 'react';
import { AssessmentResult, CareType, ANS_BALANCE_DESCRIPTIONS } from '../../../types';

interface SecretPointSectionProps {
    result: AssessmentResult;
    showSecretPoint: boolean;
    setShowSecretPoint: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SecretPointSection: React.FC<SecretPointSectionProps> = ({
    result,
    showSecretPoint,
    setShowSecretPoint
}) => {
    return (
        <div className="mt-8 no-print">
            <button
                onClick={() => setShowSecretPoint(!showSecretPoint)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${showSecretPoint
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{showSecretPoint ? '🔓' : '🔒'}</span>
                    <div className="text-left">
                        <p className="font-bold text-sm">전문가 소견 (Secret Point)</p>
                        <p className={`text-[10px] ${showSecretPoint ? 'text-slate-300' : 'text-slate-400'}`}>
                            관리자 전용 - 학생/학부모에게 표시되지 않습니다
                        </p>
                    </div>
                </div>
                <span className={`text-sm font-bold transition-transform ${showSecretPoint ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {showSecretPoint && (
                <div className="mt-4 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 text-white animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                        <span className="text-xl">🔐</span>
                        <h4 className="font-bold text-amber-400 uppercase tracking-wider text-sm">SECRET POINT - 전문가 전용</h4>
                    </div>

                    {/* 임상적 해석 */}
                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-amber-300 font-bold text-xs mb-2">📊 임상적 해석 {result.hrv.portableHrv ? '(Portable Mode)' : '(Clinical Mode)'}</p>
                            <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                                {result.hrv.portableHrv ? (
                                    <>
                                        <li>• <strong>자율신경 유형:</strong> {ANS_BALANCE_DESCRIPTIONS[result.hrv.portableHrv.ansBalanceType].label} — {ANS_BALANCE_DESCRIPTIONS[result.hrv.portableHrv.ansBalanceType].description}</li>
                                        <li>• <strong>스트레스 지수:</strong> {result.hrv.portableHrv.stressIndex} — {
                                            result.hrv.portableHrv.stressIndex >= 60 ? '심각한 만성 스트레스' :
                                                result.hrv.portableHrv.stressIndex >= 45 ? '스트레스 저항력 약화' :
                                                    result.hrv.portableHrv.stressIndex >= 35 ? '초기 스트레스 진행' : '양호한 스트레스 반응'
                                        }</li>
                                        <li>• <strong>맥박 변화도:</strong> {result.hrv.portableHrv.pulseVariability} — {
                                            result.hrv.portableHrv.pulseVariability <= 20 ? '자율신경 조절능력 고갈' :
                                                result.hrv.portableHrv.pulseVariability <= 30 ? '조절능력 저하 주의' : '활발한 자율신경 조절'
                                        }</li>
                                        <li>• <strong>혈관 건강지수:</strong> {result.hrv.portableHrv.vascularHealthIndex > 0 ? '+' : ''}{result.hrv.portableHrv.vascularHealthIndex} — {
                                            result.hrv.portableHrv.vascularHealthIndex > 20 ? '혈관 노화 진행 위험' :
                                                result.hrv.portableHrv.vascularHealthIndex > 5 ? '경계 수준' : '양호한 혈관 탄성도'
                                        }</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• <strong>SNS/PNS 균형:</strong> {result.hrv.sns}% / {result.hrv.pns}% — {
                                            result.hrv.sns > 65 ? '교감신경 과활성화 상태, 만성 긴장 패턴 관찰' :
                                                result.hrv.sns < 35 ? '부교감신경 우세, 에너지 저하 가능성' :
                                                    '정상 범위 내 균형 유지'
                                        }</li>
                                        <li>• <strong>BAI 점수:</strong> {result.survey.bai}점 — {
                                            result.survey.bai >= 30 ? '심한 불안 수준, 임상적 개입 권고' :
                                                result.survey.bai >= 20 ? '상당한 불안 수준, 전문 상담 고려' :
                                                    result.survey.bai >= 10 ? '경미한 불안 경향' :
                                                        '정상 범위'
                                        }</li>
                                        <li>• <strong>ISI 점수:</strong> {result.survey.isi}점 — {
                                            result.survey.isi >= 22 ? '중증 불면증 의심, 수면 전문의 의뢰 권고' :
                                                result.survey.isi >= 15 ? '중등도 불면증, 수면 위생 교육 필요' :
                                                    result.survey.isi >= 8 ? '경미한 수면 문제' :
                                                        '양호한 수면 패턴'
                                        }</li>
                                        <li>• <strong>집중력:</strong> {result.hrv.concentrationCategory || '미측정'} — {
                                            result.hrv.concentrationCategory === '매우 높음' ? '최상위 수준의 집중력 유지 능력' :
                                                result.hrv.concentrationCategory === '높음' ? '우수한 집중력 상태' :
                                                    result.hrv.concentrationCategory === '적정' ? '안정적인 평균 수준의 집중력' :
                                                        result.hrv.concentrationCategory === '낮음' ? '집중력 저하 상태, 개선 훈련 필요' :
                                                            result.hrv.concentrationCategory === '매우 낮음' ? '심각한 집중력 저하, 즉각적인 개입 권장' : '데이터 없음'
                                        }</li>
                                        <li>• <strong>주의력:</strong> {result.hrv.attentionCategory || '미측정'} — {
                                            result.hrv.attentionCategory === '매우 높음' ? '최상위 수준의 주의 집중력' :
                                                result.hrv.attentionCategory === '높음' ? '우수한 주의력 상태' :
                                                    result.hrv.attentionCategory === '적정' ? '안정적인 주의력 유지' :
                                                        result.hrv.attentionCategory === '낮음' ? '주의 산만 경향, 환경 통제 필요' :
                                                            result.hrv.attentionCategory === '매우 낮음' ? '고도의 주의 산만, 각성 조절 훈련 필수' : '데이터 없음'
                                        }</li>
                                        <li>• <strong>뇌 스트레스:</strong> {result.hrv.brainStressCategory || '미측정'} — {
                                            result.hrv.brainStressCategory === '매우 높음' ? '극심한 두뇌 과부하 상태, 즉각적인 휴식 필수' :
                                                result.hrv.brainStressCategory === '높음' ? '두뇌 피로도 높음, 이완 훈련 권장' :
                                                    result.hrv.brainStressCategory === '적정' ? '적절한 인지 부하 상태' :
                                                        result.hrv.brainStressCategory === '낮음' ? '안정적이고 편안한 두뇌 상태' :
                                                            result.hrv.brainStressCategory === '매우 낮음' ? '최적의 이완 상태 또는 각성 저하 가능성' : '데이터 없음'
                                        }</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Care Type 분석 */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-amber-300 font-bold text-xs mb-2">🎯 진단 유형 분석</p>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-amber-500 text-black rounded-full text-xs font-black">{result.careType}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                {result.classificationResult?.reasoning || '분류 결과를 기반으로 한 전문 소견이 여기에 표시됩니다.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

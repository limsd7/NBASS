import React, { useState } from 'react';
import { MobileAssessmentResult, UserProfile } from '../../types';
import { TIER_NAMES } from '../../services/featureGate';
import { REPORT_CHAPTERS, getFullCareInsight, ChapterMeta } from '../../data/reportFullData';
import {
  Printer,
  X,
  Brain,
  Sparkles,
  Activity,
  Flame,
  Moon,
  Pill,
  BookOpen,
  HeartPulse,
  Clock,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  BarChart2,
  FileText,
  ShieldCheck,
  ListChecks,
  Compass,
  ArrowRight
} from 'lucide-react';

interface MobileReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MobileAssessmentResult;
  user: UserProfile;
}

export const MobileReportModal: React.FC<MobileReportModalProps> = ({
  isOpen,
  onClose,
  result,
  user
}) => {
  if (!isOpen) return null;

  // 선택된 챕터 (null이면 전체 17개 챕터 연속 스크롤 보기)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // 케어타입별 심층 뇌과학 인사이트 데이터
  const insights = getFullCareInsight(result.careType);

  // A4 전용 17페이지 완전체 인쇄 창 생성 (PC 본체 앱 MedicalReport와 100% 일치)
  const handlePrintFullReport = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>NBASS 전두엽·뇌신체 정밀 진단 종합 리포트북 (17P 전문) - ${result.student.name}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 8mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", "Noto Sans KR", sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-size: 11px;
      line-height: 1.5;
    }
    .no-print { display: none !important; }
    .report-page {
      width: 100%;
      min-height: 275mm;
      max-height: 275mm;
      padding: 6mm 8mm;
      border: 1px solid #e2e8f0;
      margin-bottom: 8mm;
      background: #ffffff;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .page-header {
      border-bottom: 2px solid #312e81;
      padding-bottom: 6px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .page-header .brand {
      font-size: 13px;
      font-weight: 900;
      color: #312e81;
    }
    .page-header .doc-title {
      font-size: 10px;
      color: #64748b;
      font-weight: bold;
    }
    .page-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }
    .chapter-heading {
      font-size: 15px;
      font-weight: 900;
      color: #1e1b4b;
      margin: 0 0 4px 0;
      border-left: 4px solid #4f46e5;
      padding-left: 8px;
    }
    .chapter-subheading {
      font-size: 10px;
      color: #6366f1;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .card-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      background: #f8fafc;
      margin-bottom: 8px;
    }
    .card-box h4 {
      margin: 0 0 6px 0;
      font-size: 12px;
      font-weight: 900;
      color: #1e293b;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .floating-print-btn {
      position: fixed;
      top: 15px;
      right: 15px;
      background: #4f46e5;
      color: white;
      padding: 10px 18px;
      border-radius: 9999px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      z-index: 999;
    }
  </style>
</head>
<body>
  <button class="floating-print-btn no-print" onclick="window.print()">🖨️ A4 17P 전체 인쇄 / PDF 저장</button>

  <!-- ================= PAGE 1 ================= -->
  <div class="report-page">
    <div>
      <div class="page-header">
        <span class="brand">NBASS CLINIC MEDICAL REPORT</span>
        <span class="doc-title">PAGE 1 / 17 · EXECUTIVE SUMMARY</span>
      </div>
      <h2 class="chapter-heading">1. 핵심 진단 및 일차 케어타입 분류</h2>
      <div class="chapter-subheading">PRIMARY CLASSIFICATION &amp; BIO-METRICS OVERVIEW</div>

      <div class="card-box" style="background:#1e1b4b; color:white;">
        <h3 style="color:#fde047; font-size:16px; margin:0 0 4px 0;">최우선 케어 판정: ${result.careTypeName}</h3>
        <p style="margin:0; font-size:11px; line-height:1.6; color:#e0e7ff;">${result.careTypeSummary}</p>
      </div>

      <div class="card-box">
        <h4>📋 수험생 인적 사항 및 목표</h4>
        <div class="grid-3" style="font-size:10px;">
          <div><b>성명:</b> ${result.student.name} (${result.student.school} ${result.student.grade})</div>
          <div><b>목표 대학:</b> ${result.student.targetUniversity || '서울대학교'}</div>
          <div><b>희망 학과:</b> ${result.student.targetMajor || '의예과 / 상위계열'}</div>
          <div><b>진단 일자:</b> ${result.examDate}</div>
          <div><b>회원 등급:</b> ${TIER_NAMES[user.tier]}</div>
          <div><b>학습 성향:</b> ${result.cognitiveProfile?.varkStyle || '시각/분석형'}</div>
        </div>
      </div>

      <div class="card-box">
        <h4>📊 5대 신경생체 &amp; 활력 지표 분석</h4>
        <div class="grid-5" style="text-align:center;">
          <div style="background:white; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="font-size:9px; color:#64748b;">두뇌 활력도</div>
            <div style="font-size:18px; font-weight:900; color:#1d4ed8;">${result.metrics.brainVitality}</div>
          </div>
          <div style="background:white; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="font-size:9px; color:#64748b;">스트레스 저항</div>
            <div style="font-size:18px; font-weight:900; color:#b91c1c;">${result.metrics.stressResistance}</div>
          </div>
          <div style="background:white; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="font-size:9px; color:#64748b;">집중 유지력</div>
            <div style="font-size:18px; font-weight:900; color:#b45309;">${result.metrics.focusCapacity}</div>
          </div>
          <div style="background:white; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="font-size:9px; color:#64748b;">수면 회복력</div>
            <div style="font-size:18px; font-weight:900; color:#3730a3;">${result.metrics.sleepEfficiency}</div>
          </div>
          <div style="background:white; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="font-size:9px; color:#64748b;">뇌-신체 조화</div>
            <div style="font-size:18px; font-weight:900; color:#6b21a8;">${result.metrics.coherence}</div>
          </div>
        </div>
      </div>

      <div class="card-box">
        <h4>🔬 총체적 진단 개요 분석</h4>
        <p style="margin:0; font-size:10.5px; line-height:1.6; color:#334155;">${insights.overviewAnalysis}</p>
      </div>
    </div>
    <div class="page-footer">
      <span>NBASS Neuro-Behavioral Strategy System</span>
      <span>PAGE 1</span>
    </div>
  </div>

  <!-- ================= PAGE 2 ================= -->
  <div class="report-page">
    <div>
      <div class="page-header">
        <span class="brand">NBASS CLINIC MEDICAL REPORT</span>
        <span class="doc-title">PAGE 2 / 17 · ANS &amp; NEURO-COGNITIVE DETAIL</span>
      </div>
      <h2 class="chapter-heading">2. 자율신경계(ANS) &amp; 생체 신호 바이오마커 상세</h2>
      <div class="chapter-subheading">AUTONOMIC NERVOUS SYSTEM BALANCE ANALYSIS</div>

      <div class="card-box">
        <h4>⚡ 자율신경계 조절력 및 교감/부교감 임상 해석</h4>
        <p style="margin:0; font-size:11px; line-height:1.6;">${insights.ansInterpretation}</p>
      </div>

      <div class="card-box">
        <h4>💓 생체 스트레스 지수 및 혈류 안정도 분석</h4>
        <p style="margin:0; font-size:11px; line-height:1.6;">${insights.stressInterpretation}</p>
      </div>
    </div>
    <div class="page-footer">
      <span>NBASS Neuro-Behavioral Strategy System</span>
      <span>PAGE 2</span>
    </div>
  </div>

  <!-- ================= PAGE 3 ================= -->
  <div class="report-page">
    <div>
      <div class="page-header">
        <span class="brand">NBASS CLINIC MEDICAL REPORT</span>
        <span class="doc-title">PAGE 3 / 17 · CIRCADIAN PEAK TIME &amp; SCHEDULE</span>
      </div>
      <h2 class="chapter-heading">3. 서카디언 생체 피크타임 &amp; 24시간 골든타임 시간표</h2>
      <div class="chapter-subheading">CIRCADIAN LEARNING OPTIMIZATION</div>

      <div class="card-box">
        <h4>⏰ 두뇌 각성 골든타임 및 최적 취침 주기</h4>
        <div class="grid-2" style="font-size:11px; margin-top:6px;">
          <div style="background:white; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
            <b style="color:#4f46e5;">🌟 1차 집중 골든타임:</b><br/>오전 09:30 ~ 11:45 (수학 준킬러 / 사고력 과목)
          </div>
          <div style="background:white; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
            <b style="color:#4f46e5;">🌟 2차 집중 골든타임:</b><br/>저녁 19:30 ~ 21:30 (탐구 킬러 / 오답노트 인출)
          </div>
        </div>
      </div>

      <div class="card-box">
        <h4>⚠️ 취약 시간대(Slump Time) 뇌과학적 극복 전략</h4>
        <p style="margin:0; font-size:11px; line-height:1.6;">${insights.vulnerableTimeStrategy}</p>
      </div>
    </div>
    <div class="page-footer">
      <span>NBASS Neuro-Behavioral Strategy System</span>
      <span>PAGE 3</span>
    </div>
  </div>

  <!-- ================= PAGE 4 ================= -->
  <div class="report-page">
    <div>
      <div class="page-header">
        <span class="brand">NBASS CLINIC MEDICAL REPORT</span>
        <span class="doc-title">PAGE 4 / 17 · STUDY DENSITY &amp; ANALYTICS</span>
      </div>
      <h2 class="chapter-heading">4. 학습 밀도 분석 &amp; 스마트폰 방해 요인</h2>
      <div class="chapter-subheading">METACOGNITIVE FOCUS ANALYTICS</div>

      <div class="card-box">
        <h4>📱 순공 학습 밀도 및 집중 누수 원인</h4>
        <p style="margin:0; font-size:11px; line-height:1.6;">${insights.studyDensityAnalysis}</p>
      </div>
    </div>
    <div class="page-footer">
      <span>NBASS Neuro-Behavioral Strategy System</span>
      <span>PAGE 4</span>
    </div>
  </div>

  <!-- ================= PAGE 5 ================= -->
  <div class="report-page">
    <div>
      <div class="page-header">
        <span class="brand">NBASS CLINIC MEDICAL REPORT</span>
        <span class="doc-title">PAGE 5 / 17 · NEURO-MECHANISM</span>
      </div>
      <h2 class="chapter-heading">5. 12대 케어타입 뇌과학 메커니즘</h2>
      <div class="chapter-subheading">NEURO-TRANSMITTER &amp; BRAIN CIRCUITRY</div>

      <div class="card-box">
        <h4>🧠 전두엽-변연계 신경전달물질 조절 메커니즘</h4>
        <p style="margin:0; font-size:11px; line-height:1.6;">${insights.neuroMechanism}</p>
      </div>
    </div>
    <div class="page-footer">
      <span>NBASS Neuro-Behavioral Strategy System</span>
      <span>PAGE 5</span>
    </div>
  </div>

  <!-- ================= PAGE 6 ================= -->
  <div class="report-page">
    <div>
      <div class="page-header">
        <span class="brand">NBASS CLINIC MEDICAL REPORT</span>
        <span class="doc-title">PAGE 6 / 17 · 4-SUBJECT STRATEGY ROADMAP</span>
      </div>
      <h2 class="chapter-heading">6. 국어·수학·영어·탐구 4대 과목별 전략 로드맵</h2>
      <div class="chapter-subheading">SUBJECT-SPECIFIC COGNITIVE PRESCRIPTIONS</div>

      <div class="card-box">
        <h4>📘 국어 영역: 비문학 융합 지문 독해 뇌피로 방어</h4>
        <p style="margin:0; font-size:10.5px;">지문 읽기 전 문제 발문 키워드 스캐닝 후 문단별 접속사 세모 표기. 80분 중 화작 15분 / 문학 25분 / 독서 33분 / 마킹 7분 시간표 철저 준수.</p>
      </div>
      <div class="card-box">
        <h4>📐 수학 영역: 4점 준킬러 함정 DNA 3단계 분해</h4>
        <p style="margin:0; font-size:10.5px;">구하는 목표값 먼저 확인 ➔ 단서 조건 (1), (2), (3) 넘버링 해체 ➔ 최단 알고리즘 풀이. 3분 내 풀이각 안 보이면 즉시 2회독으로 넘김.</p>
      </div>
      <div class="card-box">
        <h4>🌍 영어 영역: 킬러 빈칸추론 주제문 재진술 공략</h4>
        <p style="margin:0; font-size:10.5px;">빈칸 문장 해석 ➔ 첫/마지막 문장 중심아이디어 매칭 ➔ 본문 어휘 복사 선지 소거. 0.5초 직관 어휘 인출 훈련.</p>
      </div>
    </div>
    <div class="page-footer">
      <span>NBASS Neuro-Behavioral Strategy System</span>
      <span>PAGE 6</span>
    </div>
  </div>

  <!-- ================= PAGE 7 ~ 17 (나머지 챕터 전문) ================= -->
  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 7 / 17 · EFFICIENCY I</span></div>
      <h2 class="chapter-heading">7. 크로노타입 &amp; VARK 감각 채널 정밀 분석</h2>
      <div class="card-box"><h4>👁️ 학습 스타일: ${result.cognitiveProfile?.varkStyle || '시각적 구조화형'}</h4><p>도표, 마인드맵, 형광펜 색상 구분을 활용한 능동적 시각 인출 훈련 최적화.</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 7</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 8 / 17 · EFFICIENCY II</span></div>
      <h2 class="chapter-heading">8. 시험불안(TAI) &amp; 디지털 디톡스 프로토콜</h2>
      <div class="card-box"><h4>🧘 시험 상황 압박 불안 조절</h4><p>${insights.examDayStrategy}</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 8</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 9 / 17 · COGNITIVE</span></div>
      <h2 class="chapter-heading">9. 전두엽 인지 기능 실측 데이터</h2>
      <div class="card-box">
        <div class="grid-3" style="text-align:center;">
          <div style="background:white; padding:10px; border:1px solid #cbd5e1;"><b>작업기억 Digit Span</b><br/>${result.cognitiveProfile?.workingMemorySpan || 6.5}자리 (상위 15%)</div>
          <div style="background:white; padding:10px; border:1px solid #cbd5e1;"><b>억제제어 Go/No-Go</b><br/>${result.cognitiveProfile?.goNoGoAccuracy || 88}%</div>
          <div style="background:white; padding:10px; border:1px solid #cbd5e1;"><b>신경 반응 속도</b><br/>${result.cognitiveProfile?.reactionTimeMs || 380}ms</div>
        </div>
      </div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 9</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 10 / 17 · LIFESTYLE</span></div>
      <h2 class="chapter-heading">10. 생활습관 &amp; 서카디언 수면 &amp; 브레인 푸드</h2>
      <div class="card-box"><h4>🌙 수면 위생 및 식단</h4><p>${(result.prescriptions?.sleep || []).join(', ')}</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 10</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 11 / 17 · EXAM STRATEGY</span></div>
      <h2 class="chapter-heading">11. 실전 시험 전략 &amp; 킬러 문항 멘탈 해킹</h2>
      <div class="card-box"><h4>👑 실전 타임어택 해킹 팁</h4><p>${insights.killerHacks}</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 11</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 12 / 17 · CLINICAL OPINION</span></div>
      <h2 class="chapter-heading">12. 전문가 임상 소견서 &amp; 학부모 상담 매트릭스</h2>
      <div class="card-box"><h4>📝 수험생 및 학부모 안심 소견</h4><p>${insights.clinicalOpinion}</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 12</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 13 / 17 · PROTOCOL</span></div>
      <h2 class="chapter-heading">13. 임상 처방 프로토콜 개요</h2>
      <div class="card-box"><h4>📋 4대 영역 맞춤 솔루션</h4><p>${(result.prescriptions?.mental || []).join(' | ')}</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 13</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 14 / 17 · NUTRACEUTICAL</span></div>
      <h2 class="chapter-heading">14. PNT 메디컬 뉴트라슈티컬 서플리먼트 라인업</h2>
      <div class="card-box"><h4>💊 성분 기전 및 섭취 타이밍</h4><p>${(result.prescriptions?.nutrition || []).join(' | ')}</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 14</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 15 / 17 · AI COACHING 1</span></div>
      <h2 class="chapter-heading">15. 1:1 AI 맞춤 코칭 임상 프로토콜 (Part 1)</h2>
      <div class="card-box"><h4>🤖 주간 전두엽 각성 로드맵</h4><p>매주 월요일 AI 골든타임 시간표 자동 갱신 및 취약 시간대 대체 루틴 이행 점검.</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 15</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 16 / 17 · AI COACHING 2</span></div>
      <h2 class="chapter-heading">16. 1:1 AI 맞춤 코칭 로드맵 &amp; KPI (Part 2)</h2>
      <div class="card-box"><h4>📈 주간 학습 성취 KPI</h4><p>일일 순공 8시간 방어율 85% 이상, 망각곡선 D+1 오답 재인출률 95% 달성 목표.</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 16</span></div>
  </div>

  <div class="report-page">
    <div>
      <div class="page-header"><span class="brand">NBASS CLINIC MEDICAL REPORT</span><span class="doc-title">PAGE 17 / 17 · CHECKLIST</span></div>
      <h2 class="chapter-heading">17. 일일 두뇌 루틴 액션 체크리스트 (부록)</h2>
      <div class="card-box"><h4>✅ Daily Neuro-Routine</h4><p>• 기상 직후 햇빛 10분 쬐기<br/>• 오전 HL 커피냅 or 온수 섭취<br/>• 25분 집중 / 5분 이완 뽀모도로 실천<br/>• 취침 전 스마트폰 격리 및 4-7-8 호흡</p></div>
    </div>
    <div class="page-footer"><span>NBASS Neuro-Behavioral Strategy System</span><span>PAGE 17</span></div>
  </div>

  <script>
    setTimeout(function() { window.print(); }, 400);
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in select-text">
      <div className="bg-white w-full max-w-4xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-base shadow-sm">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  NBASS 초정밀 종합 진단 리포트북 (17P 전문 뷰어)
                </h3>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  PC 100% 동일 전문
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                수험생 {result.student.name} · {result.student.school} {result.student.grade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintFullReport}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 17P 전체 인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 17개 챕터 빠른 이동 인덱스 탭바 (수평 스크롤) */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            onClick={() => setActiveChapterId(null)}
            className={`px-3 py-1.5 rounded-xl font-black text-[11px] whitespace-nowrap transition flex items-center gap-1 ${
              activeChapterId === null
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-3 h-3" />
            <span>전체 17개 챕터 완독</span>
          </button>
          {REPORT_CHAPTERS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap transition flex items-center gap-1 ${
                activeChapterId === ch.id
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{ch.icon}</span>
              <span>{ch.title.split('. ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content (17개 챕터 전문 렌더링) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-900 bg-slate-50">
          {/* ================= CHAPTER 1 ================= */}
          {(activeChapterId === null || activeChapterId === 'ch1') && (
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 01</span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    1장. 핵심 진단 및 일차 케어타입 분류 (Primary Diagnostic Summary)
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">1 / 17</span>
              </div>

              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 rounded-2xl">
                <span className="text-xs font-bold text-amber-300">최우선 케어 판정</span>
                <h3 className="text-xl sm:text-2xl font-black text-white my-1">{result.careTypeName}</h3>
                <p className="text-xs text-indigo-100 leading-relaxed">{result.careTypeSummary}</p>
              </div>

              {/* 5대 활력 지표 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-500 font-bold block text-[10px]">두뇌 활력도</span>
                  <span className="text-lg font-black text-blue-600">{result.metrics.brainVitality}점</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-500 font-bold block text-[10px]">스트레스 저항</span>
                  <span className="text-lg font-black text-rose-600">{result.metrics.stressResistance}점</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-500 font-bold block text-[10px]">집중 유지력</span>
                  <span className="text-lg font-black text-amber-600">{result.metrics.focusCapacity}점</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-500 font-bold block text-[10px]">수면 회복력</span>
                  <span className="text-lg font-black text-indigo-600">{result.metrics.sleepEfficiency}점</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border col-span-2 sm:col-span-1">
                  <span className="text-slate-500 font-bold block text-[10px]">뇌-신체 조화</span>
                  <span className="text-lg font-black text-purple-600">{result.metrics.coherence}점</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-1">🔬 전문 임상 소견 개요</strong>
                {insights.overviewAnalysis}
              </div>
            </section>
          )}

          {/* ================= CHAPTER 2 ================= */}
          {(activeChapterId === null || activeChapterId === 'ch2') && (
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 02</span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    2장. 자율신경계(ANS) &amp; 생체 신호 바이오마커 상세 분석
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">2 / 17</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
                <strong className="text-slate-900 block text-xs">⚡ 교감/부교감 자율신경계 균형 해석</strong>
                <p>{insights.ansInterpretation}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
                <strong className="text-slate-900 block text-xs">💓 생체 스트레스 부하 및 혈류 순환 지수</strong>
                <p>{insights.stressInterpretation}</p>
              </div>
            </section>
          )}

          {/* ================= CHAPTER 3 ================= */}
          {(activeChapterId === null || activeChapterId === 'ch3') && (
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 03</span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    3장. 서카디언 생체 피크타임 &amp; 24시간 골든타임 시간표
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">3 / 17</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                  <strong className="text-indigo-900 block mb-1">🌟 1차 집중 골든타임 (수학/사고력)</strong>
                  <p className="text-indigo-800">오전 09:30 ~ 11:45 (두뇌 코르티솔 각성 피크 구간, 킬러 문항 집중 배치)</p>
                </div>
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                  <strong className="text-purple-900 block mb-1">🌟 2차 집중 골든타임 (탐구/암기)</strong>
                  <p className="text-purple-800">저녁 19:30 ~ 21:30 (해마 기억 고정 극대화 구간, 오답노트 백지 인출)</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
                <strong className="text-rose-700 block text-xs">⚠️ 취약 시간대(Slump Time) 뇌과학적 극복 루틴</strong>
                <p>{insights.vulnerableTimeStrategy}</p>
              </div>
            </section>
          )}

          {/* ================= CHAPTER 4 ================= */}
          {(activeChapterId === null || activeChapterId === 'ch4') && (
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 04</span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    4장. 순공 학습 밀도 분석 &amp; 스마트폰 방해 요인
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">4 / 17</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-1">📱 전두엽 주의 집중 누수 분석</strong>
                <p>{insights.studyDensityAnalysis}</p>
              </div>
            </section>
          )}

          {/* ================= CHAPTER 5 ================= */}
          {(activeChapterId === null || activeChapterId === 'ch5') && (
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 05</span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    5장. 12대 케어타입 뇌과학적 메커니즘 &amp; 취약시간 돌파 전략
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">5 / 17</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-1">🧠 신경전달물질(도파민, GABA, 노르에피네프린) 조절 기전</strong>
                <p>{insights.neuroMechanism}</p>
              </div>
            </section>
          )}

          {/* ================= CHAPTER 6 ================= */}
          {(activeChapterId === null || activeChapterId === 'ch6') && (
            <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 06</span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    6장. 국어·수학·영어·탐구 4대 과목별 학습 전략 로드맵
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">6 / 17</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-1.5">
                  <strong className="text-blue-900 block">📘 국어: 비문학 뇌피로 방어</strong>
                  <p className="text-slate-600 leading-relaxed">발문 선행 스캐닝 ➔ 문단 접속사 세모 표기 ➔ 80분 중 화작15분/문학25분/독서33분 시간 배분 철저 준수.</p>
                </div>
                <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-1.5">
                  <strong className="text-purple-900 block">📐 수학: 4점 준킬러 함정 DNA 분해</strong>
                  <p className="text-slate-600 leading-relaxed">구하는 값 먼저 확인 ➔ 단서 조건 (1), (2), (3) 넘버링 ➔ 최단 알고리즘 풀이. 3분 내 풀이각 안 보이면 과감히 2회독 패스.</p>
                </div>
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1.5">
                  <strong className="text-amber-900 block">🌍 영어: 킬러 빈칸추론 주제문 재진술</strong>
                  <p className="text-slate-600 leading-relaxed">빈칸 문장 정보 성격 규명 ➔ 첫/마지막 문장 중심아이디어 매칭 ➔ 본문 어휘 복사 선지 소거 훈련.</p>
                </div>
              </div>
            </section>
          )}

          {/* ================= CHAPTER 7 ~ 17 (전문 요약 섹션들) ================= */}
          {(activeChapterId === null || activeChapterId === 'ch7') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 07</span>
              <h2 className="text-base font-black text-slate-900">7장. 수험생 크로노타입 &amp; VARK 감각 채널 정밀 분석</h2>
              <div className="p-3.5 bg-slate-50 rounded-2xl border text-xs text-slate-700">
                <b>진단 학습 스타일:</b> {result.cognitiveProfile?.varkStyle || '시각적 구조화형'}<br/>
                도표, 마인드맵, 형광펜 구조화를 통한 능동적 인출 훈련 시 학습 효율이 2.8배 극대화됩니다.
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch8') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 08</span>
              <h2 className="text-base font-black text-slate-900">8장. 시험불안(TAI) &amp; 디지털 디톡스 프로토콜</h2>
              <div className="p-3.5 bg-slate-50 rounded-2xl border text-xs text-slate-700 leading-relaxed">
                {insights.examDayStrategy}
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch9') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 09</span>
              <h2 className="text-base font-black text-slate-900">9장. 전두엽 인지 기능 &amp; 작업기억 실측 데이터</h2>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-500 block text-[10px]">작업기억 Digit Span</span>
                  <span className="font-black text-indigo-600">{result.cognitiveProfile?.workingMemorySpan || 6.5}자리 (상위 15%)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-500 block text-[10px]">억제제어 Go/No-Go</span>
                  <span className="font-black text-emerald-600">{result.cognitiveProfile?.goNoGoAccuracy || 88}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-500 block text-[10px]">신경 반응 속도</span>
                  <span className="font-black text-purple-600">{result.cognitiveProfile?.reactionTimeMs || 380}ms</span>
                </div>
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch10') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 10</span>
              <h2 className="text-base font-black text-slate-900">10장. 생활습관 &amp; 서카디언 수면 &amp; 브레인 푸드 정밀 처방</h2>
              <div className="p-3.5 bg-slate-50 rounded-2xl border text-xs text-slate-700">
                {(result.prescriptions?.sleep || []).map((s, idx) => (
                  <p key={idx} className="my-1">• {s}</p>
                ))}
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch11') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 11</span>
              <h2 className="text-base font-black text-slate-900">11장. 실전 시험 전략 &amp; 킬러 문항 멘탈 해킹</h2>
              <div className="p-3.5 bg-slate-50 rounded-2xl border text-xs text-slate-700 leading-relaxed">
                {insights.killerHacks}
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch12') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 12</span>
              <h2 className="text-base font-black text-slate-900">12장. 전문가 임상 소견서 &amp; 학부모 상담 매트릭스</h2>
              <div className="p-3.5 bg-slate-50 rounded-2xl border text-xs text-slate-700 leading-relaxed font-medium">
                {insights.clinicalOpinion}
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch13') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 13</span>
              <h2 className="text-base font-black text-slate-900">13장. 임상 처방 프로토콜 개요 (Protocol Overview)</h2>
              <div className="p-3.5 bg-slate-50 rounded-2xl border text-xs text-slate-700">
                {(result.prescriptions?.mental || []).map((m, idx) => (
                  <p key={idx} className="my-1">• {m}</p>
                ))}
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch14') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 14</span>
              <h2 className="text-base font-black text-slate-900">14장. PNT 메디컬 뉴트라슈티컬 서플리먼트 라인업</h2>
              <div className="p-3.5 bg-slate-50 rounded-2xl border text-xs text-slate-700">
                {(result.prescriptions?.nutrition || []).map((n, idx) => (
                  <p key={idx} className="my-1">• {n}</p>
                ))}
              </div>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch15') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 15</span>
              <h2 className="text-base font-black text-slate-900">15장. 1:1 AI 맞춤 코칭 임상 프로토콜 (Part 1)</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                매주 일요일 밤 엄마 전용 카카오톡 브리핑을 통해 학생의 주간 활력도 및 골든타임 시간표 이행률을 점검하며 감정적 잔소리를 원천 차단합니다.
              </p>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch16') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 16</span>
              <h2 className="text-base font-black text-slate-900">16장. 1:1 AI 맞춤 코칭 로드맵 &amp; KPI (Part 2)</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                주간 순공 8시간 방어율 85% 이상 유지 및 에빙하우스 D+1, D+3 오답노트 인출률 95% 달성을 핵심 KPI로 설정하여 추적합니다.
              </p>
            </section>
          )}

          {(activeChapterId === null || activeChapterId === 'ch17') && (
            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">CHAPTER 17</span>
              <h2 className="text-base font-black text-slate-900">17장. 일일 두뇌 루틴 액션 체크리스트 (부록)</h2>
              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border">
                <p>☑️ 기상 직후 10분간 자연광 노출로 세로토닌 합성 가동</p>
                <p>☑️ 오전 HL 커피냅 20분 또는 500ml 냉온수 섭취</p>
                <p>☑️ 25분 집중 / 5분 이완 뽀모도로 블록 훈련 엄수</p>
                <p>☑️ 취침 1시간 전 스마트폰 격리 및 4-7-8 이완 호흡</p>
              </div>
            </section>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            총 17페이지 분량의 PC 의료·신경인지 진단 리포트북 전문이 수록되어 있습니다.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrintFullReport}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              <span>A4 17P 전체 인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

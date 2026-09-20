import React, { useState } from "react";
import { SubjectGrade, WrongNote, SubjectGoal, NotificationSetting, StudentProfile } from "../types";
import { MessageSquareCode, Copy, Check, Send, Sparkles, Phone, ShieldCheck } from "lucide-react";
import { getCareTypeDetail } from "../data/careTypesData";

interface ParentKakaoTalkProps {
  grades: SubjectGrade[];
  wrongNotes: WrongNote[];
  goals: SubjectGoal[];
  notification: NotificationSetting;
  profile: StudentProfile;
}

export function ParentKakaoTalk({ grades, wrongNotes, goals, notification, profile }: ParentKakaoTalkProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);

  const currentCare = getCareTypeDetail(profile.careType || "BRAIN_FATIGUE");

  // Compute statistics for report
  const totalGrades = grades.length;
  const avgScore = totalGrades > 0 ? (grades.reduce((acc, g) => acc + g.score, 0) / totalGrades).toFixed(1) : "0.0";
  const unresolvedNotes = wrongNotes.filter((n) => !n.isResolved).length;
  const resolvedNotes = wrongNotes.filter((n) => n.isResolved).length;

  const kakaoMessage = `[EduGrade Pro 학부모 안심 알림톡]

안녕하세요, ${notification.parentName}님! 
${profile.schoolName} ${profile.gradeLevel} ${profile.name} 학생의 주간 학습 및 성적 리포트를 안내해 드립니다.

📚 [주간 학습 현황 리포트]
• 학생 이름: ${profile.name} (${profile.gradeLevel})
• 전체 평균 점수: ${avgScore}점
• 등록된 성적 과목 수: ${totalGrades}과목
• 오답노트 복습 완료: ${resolvedNotes}문항 (미해결 ${unresolvedNotes}문항)

🧠 [컨디션 및 뇌파·자율신경 Care Type 리포트]
• 현재 상태: ${currentCare.emoji} ${currentCare.title} (${currentCare.subtitle})
• 학부모 코칭 가이드: ${currentCare.prescription}

🎯 [과목별 목표 현황]
${goals.map((g) => `- ${g.subject}: 목표 ${g.targetScore}점 (${g.targetGrade}${profile.level === "high" ? "등급" : ""})`).join("\n")}

💡 [선생님 / AI 컨설턴트 코멘트]
"${profile.name} 학생이 이번 주 계획된 학습 일정을 성실히 소화하고 있으며, 컨디션 맞춤형 뇌파 컨디셔닝을 병행하고 있습니다. 학부모님의 따뜻한 격려와 관심 부탁드립니다."

* 본 알림톡은 EduGrade Pro 학습 관리 시스템을 통해 자동 생성되었습니다.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(kakaoMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendSimulation = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">학부모 알림톡 연동 및 리포트</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30">
              카카오톡 알림톡 스타일
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">학생의 성적 추이와 학습 리포트를 학부모님께 카카오톡 알림톡 형식으로 간편하게 전송하고 공유하세요.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="bg-white/60 hover:bg-white/90 border border-white/80 text-slate-700 font-medium px-4 py-2.5 rounded-2xl text-sm flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "복사완료!" : "내용 복사하기"}</span>
          </button>
          <button
            onClick={handleSendSimulation}
            className="bg-[#fee500] hover:bg-[#fdd835] text-slate-950 font-bold px-5 py-2.5 rounded-2xl text-sm shadow-md flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>알림톡 전송 시뮬레이션</span>
          </button>
        </div>
      </div>

      {sent && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-sm flex items-center space-x-3 backdrop-blur-md animate-in fade-in">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">학부모님({notification.parentPhone}) 번호로 알림톡이 성공적으로 발송되었습니다!</p>
            <p className="text-xs text-emerald-700 mt-0.5">실제 연동 시 카카오 비즈메시지 API를 통해 학부모 카카오톡으로 실시간 전송됩니다.</p>
          </div>
        </div>
      )}

      {/* KakaoTalk Preview Box */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-white/40 dark:border-slate-700/40 flex flex-col items-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/80">
          {/* Kakao Header */}
          <div className="bg-[#fee500] px-5 py-4 flex items-center justify-between border-b border-amber-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[#fee500] font-bold text-xs">
                EDU
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">EduGrade Pro 알림톡</h4>
                <p className="text-[10px] text-slate-600">공식 인증 메시지</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-900/10 text-slate-800 px-2 py-0.5 rounded-full font-medium">
              안심리포트
            </span>
          </div>

          {/* Message Body */}
          <div className="p-5 bg-white/80 space-y-4 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {kakaoMessage}
          </div>

          {/* Kakao Footer Actions */}
          <div className="p-3 bg-white/60 border-t border-slate-100 flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 text-xs text-center cursor-pointer shadow-xs"
            >
              내용 복사하기
            </button>
            <button
              onClick={handleSendSimulation}
              className="flex-1 py-2.5 bg-[#fee500] hover:bg-[#fdd835] text-slate-950 font-bold rounded-2xl text-xs text-center shadow-xs cursor-pointer"
            >
              학부모 공유하기
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 text-center">
          💡 학부모 연락처({notification.parentPhone})로 정기 리포트가 자동으로 연동 발송됩니다.
        </p>
      </div>
    </div>
  );
}

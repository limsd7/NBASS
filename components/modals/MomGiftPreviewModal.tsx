import React, { useState } from 'react';
import { AssessmentResult } from '../../types';

interface MomGiftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AssessmentResult;
  onOpenDirectUpgrade: (reason: string) => void;
}

export const MomGiftPreviewModal: React.FC<MomGiftPreviewModalProps> = ({
  isOpen,
  onClose,
  result,
  onOpenDirectUpgrade,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const studentName = result.student?.name || '학생';
  const careType = result.careType;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nbass.io';
  const shareUrl = `${origin}/?view=landing&child=${encodeURIComponent(studentName)}&careType=${encodeURIComponent(careType)}&ref=mom_gift`;

  const kakaoMessageText = `[NBASS 두뇌 케어 연구소]\n엄마! 저 오늘 신경인지 학습 진단 검사 해봤는데 [${careType}] 유형으로 나왔어요.\n\n두뇌 피로도가 높아서 이번 시험에 아는 문제 실수 감점 위험(-8~12점)이 있대요 😭\n잔소리 대신 저한테 꼭 맞는 14P 심층 처방 리포트북이랑 매주 시간표 짜주는 주간 케어(첫 달 14,900원) 선물해주세요!\n\n👇 엄마가 확인하는 링크:\n${shareUrl}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(kakaoMessageText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = kakaoMessageText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert('클립보드 복사에 실패했습니다. 화면의 링크를 직접 복사해 주세요.');
    }
  };

  const handleShareKakao = () => {
    // 1. Web Share API 지원 시 우선 호출
    if (navigator.share) {
      navigator.share({
        title: `[NBASS] ${studentName} 학생의 두뇌 진단 결과`,
        text: kakaoMessageText,
        url: shareUrl,
      }).catch(() => {
        handleCopy();
      });
    } else {
      // 2. 미지원 시 클립보드 복사 후 알림
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-br from-amber-600 via-orange-600 to-indigo-700 relative text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer"
            aria-label="닫기"
          >
            ✕
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-amber-200 mb-2 border border-white/25">
            <span>💌</span>
            <span>엄마 소환 &amp; 리포트 선물받기 루프</span>
          </div>
          <h3 className="text-xl font-black tracking-tight leading-snug">
            엄마에게 잔소리 대신, 14P 처방 리포트북 선물받기
          </h3>
          <p className="mt-1 text-xs text-amber-100 font-medium">
            엄마 카톡으로 아래와 같이 정중하고 과학적인 진단 메시지가 전달됩니다.
          </p>
        </div>

        {/* Kakao Message Mockup Preview */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
            <span>📱 엄마 카카오톡 수신 미리보기 화면</span>
            <span className="text-[10px] text-amber-400">실시간 연동</span>
          </div>

          {/* Yellow Kakao Chat Bubble Card */}
          <div className="p-4 rounded-2xl bg-[#fee500] text-[#191919] shadow-lg space-y-3 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>🧠</span>
                <span>NBASS 두뇌 케어 연구소</span>
              </div>
              <span className="text-[10px] text-black/50 font-medium">알림톡 도착</span>
            </div>

            <div className="space-y-1.5 text-xs leading-relaxed">
              <div className="font-extrabold text-sm text-[#191919]">
                [NBASS] {studentName} 학생의 두뇌 진단 결과
              </div>
              <p className="text-xs text-black/80">
                어머니, {studentName} 학생은 현재 <strong>[{careType}]</strong> 유형으로 판정되었습니다.
                뇌 피로 누적으로 아는 문제 실수 감점 위험(-8~12점)이 감지되었습니다.
              </p>
              <div className="p-2.5 bg-black/5 rounded-xl text-[11px] text-black/90 space-y-0.5">
                <div>• 권장 조치: 14P 심층 솔루션 리포트북 &amp; 주간 안심 케어</div>
                <div>• 특별 혜택: 1회 구매자 첫 달 5,000원 즉시 할인 (첫 달 ₩14,900)</div>
              </div>
            </div>

            {/* Kakao Mockup Buttons */}
            <div className="pt-1 space-y-1.5">
              <div className="w-full py-2 bg-white rounded-lg text-center font-bold text-xs text-[#191919] shadow-sm border border-black/10">
                📄 14P 처방 리포트북 선물하기 (₩24,900)
              </div>
              <div className="w-full py-2 bg-[#3c1e1e] text-white rounded-lg text-center font-bold text-xs shadow-sm">
                👑 주간 안심 케어 선물하기 (첫 달 ₩14,900)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleShareKakao}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#fee500] hover:bg-[#ebd300] text-[#191919] font-black text-xs md:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-base">💬</span>
              <span>엄마 카카오톡으로 결과 공유하기</span>
              <span>→</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📋</span>
              <span>{copied ? '✅ 전달용 문구 복사 완료!' : '엄마 전달용 문구 & 링크 복사하기'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDirectUpgrade('학생 직접 14P 심층 처방 리포트 결제');
              }}
              className="w-full py-2.5 text-center text-xs text-indigo-300 hover:text-indigo-200 underline underline-offset-4 font-medium transition cursor-pointer"
            >
              엄마에게 보내지 않고 내가 직접 결제할래요 (단건 ₩24,900 / 정기결제 ₩19,900)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">
            💡 카카오톡 공유 시 엄마는 학생의 간이 진단 요약본과 선물하기 전용 페이지를 바로 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

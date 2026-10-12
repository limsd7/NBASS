import React, { useState } from 'react';
import { AssessmentResult } from '../../../types';
import { MomGiftPreviewModal } from '../../modals/MomGiftPreviewModal';

interface KakaoShareMomLoopProps {
  result: AssessmentResult;
  onOpenUpgrade: (reason: string) => void;
}

export const KakaoShareMomLoop: React.FC<KakaoShareMomLoopProps> = ({
  result,
  onOpenUpgrade,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const studentName = result.student?.name || '학생';

  return (
    <>
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/50 border-2 border-amber-500/40 shadow-2xl text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-36 h-36 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
              <span>💌</span>
              <span>수험생 ➔ 학부모 선물 루프</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
              공부하라는 잔소리 대신,{' '}
              <span className="text-amber-300">14P 과학적 시간표</span>를 엄마에게 선물받으세요!
            </h3>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              {studentName} 님의 뇌 피로도와 집중 리듬 결과를 엄마 카카오톡으로 전송해 보세요. 
              엄마가 잔소리 대신 <strong>매주 일요일 밤 안심 브리핑 &amp; 14P 심층 솔루션(첫 달 ₩14,900)</strong>을 선물해 주실 수 있습니다.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-auto px-6 py-4 bg-[#fee500] hover:bg-[#ebd300] text-[#191919] font-black text-xs md:text-sm rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span className="text-lg">💬</span>
              <span>엄마 카톡으로 공유하고 선물받기</span>
              <span>→</span>
            </button>

            <button
              onClick={() => onOpenUpgrade('수험생 직접 결제: 14P 리포트북 및 정기구독')}
              className="w-full sm:w-auto px-4 py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition font-medium"
            >
              직접 결제하기 (₩24,900 / 월 ₩19,900)
            </button>
          </div>
        </div>
      </div>

      {/* Mom Gift Preview Modal */}
      <MomGiftPreviewModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        result={result}
        onOpenDirectUpgrade={onOpenUpgrade}
      />
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { UserProfile, WrongNoteItem } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Camera, Plus, CheckCircle2, Sparkles, Image, AlertCircle, FileText, ChevronRight, X } from 'lucide-react';

interface WrongNotesPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const WrongNotesPage: React.FC<WrongNotesPageProps> = ({ user, onUpgradeClick }) => {
  const isPlusOrAbove = hasRequiredTier(user.tier, 'premium_plus');
  const [notes, setNotes] = useState<WrongNoteItem[]>(() => dataSyncService.getWrongNotes(user.studentId));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 폼 입력 상태
  const [subject, setSubject] = useState('수학');
  const [unitName, setUnitName] = useState('');
  const [questionNumber, setQuestionNumber] = useState('');
  const [errorReason, setErrorReason] = useState('문제 조건 오독');
  const [memo, setMemo] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<WrongNoteItem | null>(null);

  useEffect(() => {
    setNotes(dataSyncService.getWrongNotes(user.studentId));
  }, [user.studentId]);

  // 카메라 촬영 및 파일 업로드 핸들러
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) {
      alert('단원명을 입력해주세요.');
      return;
    }

    // AI 오답 처방 자동 생성 엔진
    let aiPrescription = '';
    if (errorReason === '문제 조건 오독') {
      aiPrescription = '⚡ [인지 피로형 조건 오독]: 시험 후반부 25분 초과 시 전두엽 활성도가 떨어질 때 발생합니다. 문제 지문의 정의역과 부등호 조건을 빨간 펜으로 표시하는 습관을 들이세요.';
    } else if (errorReason === '계산 실수') {
      aiPrescription = '🎯 [도파민 조급증 계산 실수]: 정답을 빨리 내려는 마음에 암산 비율이 높아질 때 생깁니다. 여백에 줄 단위 풀이법을 적용하세요.';
    } else if (errorReason === '시간 부족') {
      aiPrescription = '⏱️ [시간 배분 전략 결핍]: 킬러 문항에 10분 이상 지체되었습니다. 3분 내 풀이각이 안 보이면 과감히 넘기고 2회독 때 푸는 전략이 필요합니다.';
    } else {
      aiPrescription = '📚 [개념 연결 미흡]: 기본 정의와 문제 풀이 공식 간의 연결 고리가 약합니다. 개념서의 기본 증명 과정을 백지에 손으로 요약해보세요.';
    }

    const newNote: WrongNoteItem = {
      id: 'wn-' + Date.now(),
      studentId: user.studentId,
      subject,
      unitName: unitName.trim(),
      questionNumber: questionNumber.trim() || '문항',
      imageUrl: previewImage || undefined,
      errorReason,
      memo: memo.trim(),
      aiPrescription,
      isResolved: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await dataSyncService.saveWrongNote(newNote);
    setNotes(dataSyncService.getWrongNotes(user.studentId));

    // Reset Form
    setUnitName('');
    setQuestionNumber('');
    setMemo('');
    setPreviewImage(null);
    setIsFormOpen(false);
    alert('✅ 오답노트가 실시간 등록되고 AI 처방이 발급되었습니다!');
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-purple-600">
            <Camera className="w-4 h-4" />
            <span>스마트폰 촬영 &amp; AI 오답 처방</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">오답노트 관리</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            틀린 문제를 카메라로 찍어 올리면 즉각적인 AI 원인 분석 처방이 제공됩니다.
          </p>
        </div>
      </div>

      {/* PLUS+ 잠금 또는 기능 렌더링 */}
      {isPlusOrAbove ? (
        <div className="space-y-4">
          {/* New Note Button */}
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
            >
              <Camera className="w-5 h-5" />
              <span>틀린 문제 카메라로 촬영 / 등록하기</span>
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Form Modal / Accordion */}
          {isFormOpen && (
            <div className="bg-white p-5 rounded-3xl border-2 border-purple-300 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>새 오답 문제 등록 &amp; 처방</span>
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {/* 1. Camera / Photo Upload Button */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    📷 문제 사진 촬영 / 이미지 첨부
                  </label>
                  <div className="border-2 border-dashed border-purple-200 rounded-2xl p-4 text-center bg-purple-50/40 relative hover:bg-purple-50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageCapture}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {previewImage ? (
                      <div className="relative inline-block">
                        <img
                          src={previewImage}
                          alt="미리보기"
                          className="max-h-36 rounded-xl object-contain mx-auto shadow-sm"
                        />
                        <span className="block text-[10px] text-purple-700 font-bold mt-1">
                          탭하여 사진 다시 찍기
                        </span>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Camera className="w-8 h-8 text-purple-400 mx-auto mb-1" />
                        <p className="font-bold text-slate-700">카메라로 문제 촬영 또는 사진 선택</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">스마트폰 카메라가 자동으로 실행됩니다</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. 과목 & 문항 번호 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">과목 선택</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="수학">수학</option>
                      <option value="국어">국어</option>
                      <option value="영어">영어</option>
                      <option value="탐구1">탐구 (과탐/사탐)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">문항 번호</label>
                    <input
                      type="text"
                      value={questionNumber}
                      onChange={(e) => setQuestionNumber(e.target.value)}
                      placeholder="예: 21번, 서술형 3번"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    >
                    </input>
                  </div>
                </div>

                {/* 3. 단원명 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">단원 및 개념명 *</label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="예: 미적분 - 여러 가지 함수의 미분법"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    required
                  />
                </div>

                {/* 4. 오답 원인 선택 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">오답 원인 (AI 분석 태그)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['문제 조건 오독', '계산 실수', '시간 부족', '개념 미숙'].map((reason) => (
                      <button
                        type="button"
                        key={reason}
                        onClick={() => setErrorReason(reason)}
                        className={`py-1.5 px-2 rounded-xl text-left font-bold transition flex items-center justify-between ${
                          errorReason === reason
                            ? 'bg-purple-100 text-purple-900 border border-purple-400'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span>{reason}</span>
                        {errorReason === reason && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. 메모 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">나의 풀이 오답 메모</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={2}
                    placeholder="어떤 지점에서 헷갈렸는지 간단히 적어보세요."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-sm"
                  >
                    AI 처방 발급 &amp; 저장
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Wrong Notes Card List */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between px-1">
              <span>등록된 오답노트 ({notes.length}건)</span>
              <span className="text-[10px] text-purple-600 font-bold">PC 실시간 동기화 중</span>
            </h3>

            {notes.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>아직 등록된 오답 문제가 없습니다.</p>
                <p className="text-[10px] mt-1">상단의 촬영 버튼을 눌러 틀린 문제를 올려보세요.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs hover:border-purple-300 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black">
                          {note.subject} {note.questionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                          #{note.errorReason}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {note.unitName}
                      </h4>
                      {note.memo && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {note.memo}
                        </p>
                      )}
                    </div>
                    {note.imageUrl && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={note.imageUrl} alt="문제" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* AI Prescription Snippet */}
                  {note.aiPrescription && (
                    <div className="mt-3 p-2.5 bg-purple-50/70 rounded-xl border border-purple-100 text-[11px] text-purple-950">
                      <div className="flex items-center gap-1 font-bold text-purple-900 mb-0.5">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>AI 맞춤 처방전</span>
                      </div>
                      <p className="line-clamp-2 text-slate-700">{note.aiPrescription}</p>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{note.createdAt} 등록</span>
                    <span className="text-purple-600 font-bold flex items-center gap-0.5">
                      자세히 보기 <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <LockedCard
          requiredTier="premium_plus"
          featureTitle="스마트폰 오답 촬영 &amp; AI 처방 잠금"
          description="카메라로 틀린 문제를 바로 찍어 올리고 인지 피로도 기반 맞춤 처방을 발급받는 기능은 PREMIUM PLUS (PLUS+) 등급 전용입니다."
          onUpgradeClick={onUpgradeClick}
        />
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-black text-purple-700">
                {selectedNote.subject} {selectedNote.questionNumber} 상세 처방
              </span>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {selectedNote.imageUrl && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200">
                <img src={selectedNote.imageUrl} alt="문제 사진" className="w-full object-contain max-h-60 bg-slate-50" />
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">단원명</span>
                <p className="font-bold text-slate-900 text-sm">{selectedNote.unitName}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px]">오답 원인 분석</span>
                <p className="font-bold text-rose-600">#{selectedNote.errorReason}</p>
              </div>

              {selectedNote.memo && (
                <div>
                  <span className="text-slate-400 text-[10px]">학생 오답 메모</span>
                  <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
                    {selectedNote.memo}
                  </p>
                </div>
              )}

              {selectedNote.aiPrescription && (
                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-1 font-bold text-purple-900 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>NBASS AI 뉴로 오답 처방전</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{selectedNote.aiPrescription}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedNote(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

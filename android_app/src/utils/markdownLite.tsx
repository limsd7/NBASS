import React from 'react';

/** PC 리포트 텍스트(마크다운 혼합)를 모바일용으로 렌더링. 지원: ##/### 제목, > 인용, -/* 불릿, **볼드**, --- 구분선 */
export function renderMarkdownLite(text: string | null | undefined, keyPrefix = 'md'): React.ReactNode[] {  if (!text) return [];
  const lines = String(text).split('\n');
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  const flushList = (key: string) => {
    if (listBuf.length > 0) {
      out.push(
        <ul key={`${keyPrefix}-ul-${key}`} className="list-disc pl-5 space-y-1 my-1.5">
          {listBuf.map((item, i) => (
            <li key={`${keyPrefix}-li-${key}-${i}`}>{renderInline(item, `${keyPrefix}-li-${key}-${i}`)}</li>
          ))}
        </ul>
      );
      listBuf = [];
    }
  };
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flushList(`gap${idx}`);
      return;
    }
    if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushList(`hr${idx}`);
      out.push(<hr key={`${keyPrefix}-hr-${idx}`} className="border-slate-200 my-2" />);
      return;
    }
    const h3 = line.match(/^###\s+(.*)/);
    if (h3) {
      flushList(`h${idx}`);
      out.push(<h4 key={`${keyPrefix}-h3-${idx}`} className="text-xs font-black text-slate-900 mt-2">{renderInline(h3[1], `${keyPrefix}-h3-${idx}`)}</h4>);
      return;
    }
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) {
      flushList(`h${idx}`);
      out.push(<h3 key={`${keyPrefix}-h2-${idx}`} className="text-sm font-black text-slate-900 mt-2">{renderInline(h2[1], `${keyPrefix}-h2-${idx}`)}</h3>);
      return;
    }
    const quote = line.match(/^>\s?(.*)/);
    if (quote) {
      flushList(`q${idx}`);
      out.push(
        <blockquote key={`${keyPrefix}-q-${idx}`} className="border-l-2 border-indigo-300 pl-2.5 my-1.5 text-slate-600">
          {renderInline(quote[1], `${keyPrefix}-q-${idx}`)}
        </blockquote>
      );
      return;
    }
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      listBuf.push(bullet[1]);
      return;
    }
    flushList(`p${idx}`);
    out.push(<p key={`${keyPrefix}-p-${idx}`} className="my-1">{renderInline(line, `${keyPrefix}-p-${idx}`)}</p>);
  });
  flushList('end');
  return out;
}

/** **볼드** 인라인 처리 */
export function renderInline(text: string, key: string): React.ReactNode[] {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return <strong key={`${key}-b-${i}`} className="font-black text-slate-900">{m[1]}</strong>;
    }
    return <React.Fragment key={`${key}-t-${i}`}>{part}</React.Fragment>;
  });
}

export interface ReportSection {
  key: string;
  kind: 'title' | 'stats' | 'section' | 'body';
  title?: string;
  accent: string;
  lines: string[];
}

/** 섹션 제목 키워드별 박스 색상 */
function pickAccent(title: string): string {
  const t = title;
  if (/영양|식단|비타민|아연|면역/.test(t)) return 'border-amber-200 bg-amber-50/60';
  if (/행동|생활|BMI|운동|식습관/.test(t)) return 'border-emerald-200 bg-emerald-50/60';
  if (/수면|서카디언|취침|기상/.test(t)) return 'border-indigo-200 bg-indigo-50/60';
  if (/멘탈|스트레스|호흡|마음|이완/.test(t)) return 'border-purple-200 bg-purple-50/60';
  if (/수능|실전|전략|킬러/.test(t)) return 'border-blue-200 bg-blue-50/60';
  return 'border-slate-200 bg-white';
}

const STAT_LINE = /^([^#*\-<>|\[\]]{1,18})\s*[:：]\s*(.+)$/;

/** 리포트 텍스트를 박스 단위 섹션으로 분할 (제목/통계칩/섹션/본문) */
export function splitReportSections(text: string | null | undefined): ReportSection[] {
  if (!text) return [];
  const rawLines = String(text).split('\n');
  const sections: ReportSection[] = [];
  let idx = 0;
  const push = (s: ReportSection) => {
    if (s.lines.length > 0 || s.title) {
      s.key = `sec${idx++}`;
      sections.push(s);
    }
  };
  let cur: ReportSection | null = null;
  let seenHeading = false;
  let statsPending = false;
  let topStats: string[] = [];
  const flushStats = () => {
    if (topStats.length > 0) {
      push({ key: '', kind: 'stats', accent: '', lines: topStats });
      topStats = [];
    }
    statsPending = false;
  };
  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;
    const h = line.match(/^#{2,4}\s+(.*)/);
    if (h) {
      if (cur) push(cur);
      flushStats();
      seenHeading = true;
      const title = h[1].trim();
      const isReportTitle = /Brain-Body Report|통합 진단/.test(title) && sections.length === 0;
      cur = isReportTitle
        ? { key: '', kind: 'title', title, accent: '', lines: [] }
        : { key: '', kind: 'section', title, accent: pickAccent(title), lines: [] };
      statsPending = true;
      continue;
    }
    if (statsPending && STAT_LINE.test(line)) {
      topStats.push(line);
      continue;
    }
    if (statsPending) {
      // 타이틀이 먼저 확정되어야 순서(타이틀→통계칩)가 유지됨
      if (cur && cur.kind === 'title') {
        push(cur);
        cur = null;
      }
      flushStats();
    }
    if (!seenHeading && STAT_LINE.test(line)) {
      topStats.push(line);
      continue;
    }
    // 타이틀 섹션에 본문이 오면 타이틀을 먼저 확정하고 별도 본문 섹션으로 분리
    if (!cur || cur.kind === 'title') {
      if (cur) push(cur);
      cur = { key: '', kind: 'body', accent: 'border-slate-200 bg-white', lines: [] };
    }
    cur.lines.push(rawLine);
  }
  flushStats();
  if (cur) push(cur);
  return sections;
}

/** 박스 카드 UI로 리포트 렌더링 (구조 없으면 기본 마크다운으로 폴백) */
export function renderReportBoxes(text: string | null | undefined, keyPrefix = 'rb'): React.ReactNode {
  const sections = splitReportSections(text);
  if (sections.length === 0) return null;
  if (sections.length === 1 && sections[0].kind === 'body') {
    return <div className="space-y-1.5">{renderMarkdownLite(text, keyPrefix)}</div>;
  }
  return (
    <div className="space-y-2.5">
      {sections.map((s) => {
        if (s.kind === 'title') {
          return (
            <div key={s.key} className="rounded-2xl p-3.5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xs">
              <p className="text-sm font-black leading-snug">{renderInline(s.title || '', `${s.key}-t`)}</p>
            </div>
          );
        }
        if (s.kind === 'stats') {
          return (
            <div key={s.key} className="grid grid-cols-2 gap-2">
              {s.lines.map((ln, i) => {
                const m = ln.trim().match(STAT_LINE) || [ '', ln, '' ];
                return (
                  <div key={`${s.key}-s-${i}`} className="bg-white rounded-2xl border border-slate-200 px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400">{renderInline(m[1].trim(), `${s.key}-sk-${i}`)}</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{renderInline(m[2].trim(), `${s.key}-sv-${i}`)}</p>
                  </div>
                );
              })}
            </div>
          );
        }
        // 본문 없는 섹션 제목은 슬림 헤더바로
        if (s.lines.length === 0) {
          return (
            <div key={s.key} className="rounded-xl bg-slate-800 px-3 py-2">
              <p className="text-xs font-black text-white">{renderInline(s.title || '', `${s.key}-h`)}</p>
            </div>
          );
        }
        return (
          <div key={s.key} className={`rounded-2xl border p-3.5 shadow-xs ${s.accent}`}>
            {s.title && (
              <h4 className="text-xs font-black text-slate-900 mb-1.5 leading-snug">
                {renderInline(s.title, `${s.key}-h`)}
              </h4>
            )}
            <div className="text-xs text-slate-700 leading-relaxed">
              {renderMarkdownLite(s.lines.join('\n'), `${s.key}-b`)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default renderMarkdownLite;

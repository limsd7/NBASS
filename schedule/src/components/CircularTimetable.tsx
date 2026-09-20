import React, { useState } from 'react';
import { ScheduleBlock, CareType } from '../types';
import { timeToMinutes } from '../utils/scheduler';
import { Clock, BookOpen, Coffee, School, Sparkles, Moon, Sun, Play } from 'lucide-react';

interface CircularTimetableProps {
  blocks: ScheduleBlock[];
  careType: CareType;
  selectedBlockId?: string | null;
  onSelectBlock: (id: string) => void;
  onStartPomodoro?: (block: ScheduleBlock) => void;
}

export const CircularTimetable: React.FC<CircularTimetableProps> = ({
  blocks,
  careType,
  selectedBlockId,
  onSelectBlock,
  onStartPomodoro
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<ScheduleBlock | null>(null);

  const size = 380;
  const center = size / 2;
  const outerRadius = 160;
  const innerRadius = 75;

  const activeBlock = hoveredBlock || (selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null) || null;

  // Convert minutes to angle in degrees (0 min = 0:00 at top = -90 deg)
  const minutesToAngle = (minutes: number) => {
    // 1440 minutes = 360 degrees -> 1 min = 0.25 deg
    // 0:00 is at top (-90 degrees)
    return (minutes / 1440) * 360 - 90;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeDonutArc = (x: number, y: number, rIn: number, rOut: number, startAngle: number, endAngle: number) => {
    // Handle wrap around or full circle edges gracefully
    let sweepAngle = endAngle - startAngle;
    if (sweepAngle < 0) sweepAngle += 360;
    if (sweepAngle >= 359.99) sweepAngle = 359.99;

    const actualEndAngle = startAngle + sweepAngle;
    const startOuter = polarToCartesian(x, y, rOut, actualEndAngle);
    const endOuter = polarToCartesian(x, y, rOut, startAngle);
    const startInner = polarToCartesian(x, y, rIn, startAngle);
    const endInner = polarToCartesian(x, y, rIn, actualEndAngle);

    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${rOut} ${rOut} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${rIn} ${rIn} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
      'Z'
    ].join(' ');
  };

  const getBlockFill = (type: string, isSelected: boolean, isHovered: boolean) => {
    switch (type) {
      case 'study':
        return isHovered || isSelected ? '#4338ca' : '#6366f1';
      case 'break':
        return isHovered || isSelected ? '#059669' : '#10b981';
      case 'school':
        return isHovered || isSelected ? '#0284c7' : '#38bdf8';
      case 'academy':
        return isHovered || isSelected ? '#7c3aed' : '#a855f7';
      case 'routine':
      case 'meal':
        return isHovered || isSelected ? '#d97706' : '#fbbf24';
      case 'sleep':
        return isHovered || isSelected ? '#334155' : '#64748b';
      default:
        return isHovered || isSelected ? '#52525b' : '#a1a1aa';
    }
  };

  // Hour labels (0 to 23 hours around the clock)
  const hourMarkers = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col items-center justify-between">
      {/* Top Title & Legend */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-stone-900">24시간 원형 생활계획표</h3>
            <p className="text-xs text-stone-500">부채꼴을 누르면 해당 블록으로 즉시 이동합니다</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full">
          24h 시계
        </span>
      </div>

      {/* SVG Circular Timetable */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none drop-shadow-xs max-w-full h-auto"
        >
          {/* Base Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius + 8}
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Time-of-Day (오전 / 오후 / 저녁) Outer Segment Rims for crystal-clear visual distinction */}
          {/* 오전 Rim: 0:00 to 12:00 (angles -90 to 90) */}
          <path
            d={describeDonutArc(center, center, outerRadius + 2, outerRadius + 8, -90, 90)}
            fill="#f59e0b"
            opacity="0.85"
          />
          {/* 오후 Rim: 12:00 to 18:00 (angles 90 to 180) */}
          <path
            d={describeDonutArc(center, center, outerRadius + 2, outerRadius + 8, 90, 180)}
            fill="#0284c7"
            opacity="0.85"
          />
          {/* 저녁 Rim: 18:00 to 24:00 (angles 180 to 270) */}
          <path
            d={describeDonutArc(center, center, outerRadius + 2, outerRadius + 8, 180, 270)}
            fill="#7c3aed"
            opacity="0.85"
          />

          {/* Inner Disc Background */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* Render Schedule Arcs */}
          {blocks.map((block) => {
            let startMin = timeToMinutes(block.startTime);
            let endMin = timeToMinutes(block.endTime);

            // Handle overnight block edge
            if (endMin < startMin) endMin += 1440;

            const startAngle = minutesToAngle(startMin);
            const endAngle = minutesToAngle(endMin);

            const isSelected = selectedBlockId === block.id;
            const isHovered = hoveredBlock?.id === block.id;
            const rOut = isHovered || isSelected ? outerRadius + 4 : outerRadius;
            const rIn = isHovered || isSelected ? innerRadius - 2 : innerRadius;

            const pathD = describeDonutArc(center, center, rIn, rOut, startAngle, endAngle);

            return (
              <g
                key={block.id}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredBlock(block)}
                onMouseLeave={() => setHoveredBlock(null)}
                onClick={() => onSelectBlock(block.id)}
              >
                <path
                  d={pathD}
                  fill={getBlockFill(block.type, isSelected, isHovered)}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity={block.completed ? 0.7 : 0.95}
                  className="hover:opacity-100 transition-opacity"
                />
              </g>
            );
          })}

          {/* Hour Tick Marks & Numbers with Period Color-coding */}
          {Array.from({ length: 24 }).map((_, hour) => {
            const angle = minutesToAngle(hour * 60);
            const isMajor = hour % 3 === 0;
            const tickInner = polarToCartesian(center, center, outerRadius - (isMajor ? 8 : 4), angle);
            const tickOuter = polarToCartesian(center, center, outerRadius, angle);
            const textPos = polarToCartesian(center, center, outerRadius + 18, angle);

            // Determine hour text color based on period
            let hourTextColor = '#64748b';
            if (hour < 12) hourTextColor = '#b45309'; // morning amber
            else if (hour < 18) hourTextColor = '#0369a1'; // afternoon sky
            else hourTextColor = '#6d28d9'; // evening indigo

            return (
              <g key={`hour-${hour}`}>
                <line
                  x1={tickInner.x}
                  y1={tickInner.y}
                  x2={tickOuter.x}
                  y2={tickOuter.y}
                  stroke={isMajor ? '#475569' : '#cbd5e1'}
                  strokeWidth={isMajor ? 2 : 1}
                />
                {isMajor && (
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={hourTextColor}
                    className="text-[9px] font-extrabold"
                  >
                    {hour}시
                  </text>
                )}
              </g>
            );
          })}

          {/* Center Info Circle Hole */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 4}
            fill="#ffffff"
            stroke="#f1f5f9"
            strokeWidth="2"
            className="filter drop-shadow-xs"
          />
        </svg>

        {/* Center Dynamic Label (HTML over SVG for perfect text styling) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
          style={{ width: size, height: size }}
        >
          <div className="w-[124px] flex flex-col items-center justify-center">
            {activeBlock ? (
              <div className="space-y-0.5 animate-fadeIn">
                <span className="text-[10px] font-extrabold uppercase tracking-tight text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {activeBlock.startTime}~{activeBlock.endTime}
                </span>
                <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-tight mt-1">
                  {activeBlock.title}
                </h4>
                <p className="text-[10px] text-stone-500">
                  {activeBlock.type === 'study' ? '집중 학습' : activeBlock.type === 'break' ? '맞춤 휴식' : '일과/수업'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-stone-400">
                <Clock className="w-5 h-5 mx-auto text-indigo-500/70" />
                <span className="text-[11px] font-bold text-stone-700 block">24시간 루틴</span>
                <span className="text-[9px] text-stone-400 block leading-tight">
                  구간을 터치하면<br />상세 정보 확인
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Quick Action for Active Block */}
      {activeBlock && activeBlock.type === 'study' && onStartPomodoro && (
        <button
          onClick={() => onStartPomodoro(activeBlock)}
          className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>[{activeBlock.startTime}] {activeBlock.title} 타이머 시작</span>
        </button>
      )}

      {/* Period Time Band Legend */}
      <div className="w-full pt-3 pb-2 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>오전 (00~12시)</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-sky-50 text-sky-900 font-bold border border-sky-200">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
          <span>오후 (12~18시)</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-purple-50 text-purple-900 font-bold border border-purple-200">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
          <span>저녁 (18~24시)</span>
        </div>
      </div>

      {/* Bottom Color Palette Legend */}
      <div className="w-full pt-2 grid grid-cols-3 gap-1.5 text-[11px] text-stone-600 font-medium">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
          <span>자기주도 학습</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>맞춤 휴식·명상</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
          <span>학교 정규 수업</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
          <span>학원·과외 수업</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span>기상·식사 루틴</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
          <span>수면 및 디톡스</span>
        </div>
      </div>
    </div>
  );
};

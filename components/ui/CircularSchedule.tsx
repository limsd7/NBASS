import React from 'react';

export interface SchedulePeriod {
    id: string;
    start: number; // hour (0-24)
    end: number;   // hour (0-24)
    label: string;
    color: string;
    icon?: string;
}

interface CircularScheduleProps {
    periods: SchedulePeriod[];
    isDark?: boolean;
    hideLegend?: boolean;
}

const CircularSchedule: React.FC<CircularScheduleProps> = ({ periods, isDark = false, hideLegend = false }) => {
    const size = 320;
    const center = size / 2;
    const radius = 100;
    const strokeWidth = 40;

    // Helper to calculate SVG path for an arc
    const getArcPath = (startHour: number, endHour: number) => {
        let actualEnd = endHour;
        if (actualEnd <= startHour) {
            actualEnd += 24; // Handle wrap around
        }

        const startAngle = (startHour / 24) * 360 - 90;
        const endAngle = (actualEnd / 24) * 360 - 90;
        
        // Convert polar to cartesian
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArcFlag = actualEnd - startHour > 12 ? 1 : 0;

        // Ensure we don't draw a full circle as a single arc which breaks SVG
        if (actualEnd - startHour >= 24) {
            return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center} ${center + radius} A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`;
        }

        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    };

    const getLabelPos = (startHour: number, endHour: number, offset = 0) => {
        let actualEnd = endHour;
        if (actualEnd <= startHour) {
            actualEnd += 24;
        }
        const midHour = (startHour + actualEnd) / 2;
        const angle = (midHour / 24) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const labelRadius = radius + strokeWidth / 2 + 15 + offset;
        return {
            x: center + labelRadius * Math.cos(rad),
            y: center + labelRadius * Math.sin(rad)
        };
    };

    return (
        <div className="flex flex-col items-center justify-center my-6">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background circle */}
                <circle 
                    cx={center} 
                    cy={center} 
                    r={radius} 
                    fill="none" 
                    stroke={isDark ? "#334155" : "#e2e8f0"} 
                    strokeWidth={strokeWidth} 
                />
                
                {/* Clock ticks and labels */}
                {[0, 6, 12, 18].map(hour => {
                    const angle = (hour / 24) * 360 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const innerRadius = radius - strokeWidth / 2;
                    const x1 = center + innerRadius * Math.cos(rad);
                    const y1 = center + innerRadius * Math.sin(rad);
                    const x2 = center + (innerRadius - 8) * Math.cos(rad);
                    const y2 = center + (innerRadius - 8) * Math.sin(rad);
                    const textX = center + (innerRadius - 20) * Math.cos(rad);
                    const textY = center + (innerRadius - 20) * Math.sin(rad);
                    
                    return (
                        <g key={`tick-${hour}`}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isDark ? "#64748b" : "#94a3b8"} strokeWidth="2" />
                            <text x={textX} y={textY} fontSize="12" fill={isDark ? "#94a3b8" : "#64748b"} textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                                {hour === 0 ? '24' : hour}
                            </text>
                        </g>
                    );
                })}

                {/* Periods Arcs */}
                {periods.map(period => (
                    <g key={`arc-${period.id}`}>
                        <path
                            d={getArcPath(period.start, period.end)}
                            fill="none"
                            stroke={period.color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="butt"
                            className="transition-all duration-500"
                        />
                    </g>
                ))}

                {/* Period Labels */}
                {periods.map(period => {
                    const pos = getLabelPos(period.start, period.end);
                    const isRight = pos.x > center;
                    return (
                        <g key={`label-${period.id}`}>
                            {period.icon && (
                                <text 
                                    x={pos.x} 
                                    y={pos.y - 8} 
                                    fontSize="14" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle"
                                >
                                    {period.icon}
                                </text>
                            )}
                            <text 
                                x={pos.x} 
                                y={period.icon ? pos.y + 8 : pos.y} 
                                fontSize="12" 
                                fill={isDark ? "#e2e8f0" : "#334155"} 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fontWeight="bold"
                            >
                                {period.label}
                            </text>
                        </g>
                    );
                })}
                
                <text x={center} y={center} fontSize="14" fill={isDark ? "#94a3b8" : "#64748b"} textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                    나의 하루
                </text>
            </svg>
            
            {/* Legend */}
            {!hideLegend && (
                <div className="flex flex-wrap justify-center gap-4 mt-6 px-4">
                    {periods.map(period => (
                        <div key={`legend-${period.id}`} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: period.color }}></span>
                            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{period.label} ({period.start}:00~{period.end}:00)</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CircularSchedule;

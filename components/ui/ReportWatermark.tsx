import React from 'react';

interface ReportWatermarkProps {
    show: boolean;
    children: React.ReactNode;
}

export const ReportWatermark: React.FC<ReportWatermarkProps> = ({ show, children }) => {
    if (!show) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full h-full">
            <div className="relative z-0">
                {children}
            </div>

            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex flex-col items-center justify-center space-y-32">
                {[1, 2, 3, 4].map((i) => (
                    <div 
                        key={i}
                        className="font-bold text-slate-900 select-none whitespace-nowrap opacity-[0.08]"
                        style={{
                            fontSize: '48px',
                            transform: `rotate(-30deg) translateX(${i % 2 === 0 ? '100px' : '-100px'})`
                        }}
                    >
                        NBASS 체험판
                    </div>
                ))}
            </div>
        </div>
    );
};
